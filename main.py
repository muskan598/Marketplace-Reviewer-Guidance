"""
FastAPI Main Application - Entry point for the backend server

This file sets up:
- FastAPI application
- CORS middleware
- Database initialization
- All API routes
"""

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import csv
import io
import json

from . import models, schemas, crud
from .database import engine, get_db, init_db
from .validation import validate_listing, check_duplicate_listing, get_severity_level
from .ai_reviewer import review_listing_with_ai

# Initialize database tables
init_db()

# Create FastAPI app
app = FastAPI(
    title="Marketplace Listing Quality Reviewer API",
    description="AI-powered marketplace listing review and validation system",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Health Check ============

@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "message": "Marketplace Listing Quality Reviewer API",
        "status": "operational",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    """Detailed health check"""
    return {"status": "healthy", "database": "connected"}


# ============ Listing Endpoints ============

@app.post("/api/listings", response_model=schemas.ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(listing: schemas.ListingCreate, db: Session = Depends(get_db)):
    """Create a new listing"""
    
    # Check for duplicate
    existing_listings = crud.get_listings_by_seller(db, listing.seller)
    if check_duplicate_listing(listing.title, listing.seller, existing_listings):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A listing with this title already exists for this seller"
        )
    
    # Create the listing
    db_listing = crud.create_listing(db, listing)
    
    # Create history entry
    history = schemas.ReviewHistoryCreate(
        listing_id=db_listing.id,
        action="created",
        original_data=None,
        revised_data=listing.model_dump(),
        user_notes="Listing created",
        user="system"
    )
    crud.create_history_entry(db, history)
    
    return db_listing


@app.get("/api/listings", response_model=List[schemas.ListingResponse])
def get_listings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all listings"""
    return crud.get_listings(db, skip=skip, limit=limit)


@app.get("/api/listings/{listing_id}", response_model=schemas.ListingResponse)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    """Get a single listing by ID"""
    listing = crud.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@app.get("/api/listings/{listing_id}/full")
def get_listing_full(listing_id: int, db: Session = Depends(get_db)):
    """Get listing with review and history"""
    result = crud.get_listing_with_review(db, listing_id)
    if not result:
        raise HTTPException(status_code=404, detail="Listing not found")
    return result


@app.put("/api/listings/{listing_id}", response_model=schemas.ListingResponse)
def update_listing(listing_id: int, listing_update: schemas.ListingUpdate, db: Session = Depends(get_db)):
    """Update a listing"""
    
    # Get original listing
    original = crud.get_listing(db, listing_id)
    if not original:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Store original data
    original_data = {
        "title": original.title,
        "description": original.description,
        "category": original.category,
        "price": original.price,
        "seller": original.seller,
        "attributes": original.attributes,
        "tags": original.tags
    }
    
    # Update listing
    updated_listing = crud.update_listing(db, listing_id, listing_update)
    
    # Create history entry
    history = schemas.ReviewHistoryCreate(
        listing_id=listing_id,
        action="edited",
        original_data=original_data,
        revised_data=listing_update.model_dump(exclude_unset=True),
        user_notes="Listing updated",
        user="system"
    )
    crud.create_history_entry(db, history)
    
    return updated_listing


@app.delete("/api/listings/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(listing_id: int, db: Session = Depends(get_db)):
    """Delete a listing"""
    success = crud.delete_listing(db, listing_id)
    if not success:
        raise HTTPException(status_code=404, detail="Listing not found")
    return None


# ============ Review Endpoints ============

@app.post("/api/listings/{listing_id}/review")
def review_listing(listing_id: int, db: Session = Depends(get_db)):
    """Review a listing (deterministic + AI)"""
    
    # Get the listing
    listing = crud.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Prepare listing data
    listing_data = {
        "title": listing.title,
        "description": listing.description,
        "category": listing.category,
        "price": listing.price,
        "seller": listing.seller,
        "attributes": listing.attributes,
        "tags": listing.tags
    }
    
    # Run deterministic validation
    deterministic_issues = validate_listing(listing_data)
    
    # Run AI review
    ai_result = review_listing_with_ai(listing_data)
    
    # Determine overall severity
    all_issues = deterministic_issues + ai_result.get("ai_findings", [])
    overall_severity = get_severity_level(all_issues)
    
    # Check compliance
    is_compliant = len([i for i in all_issues if i.get("severity") == "high"]) == 0
    
    # Create review record
    review = schemas.ReviewCreate(
        listing_id=listing_id,
        deterministic_issues=deterministic_issues,
        ai_findings=ai_result.get("ai_findings", []),
        overall_severity=overall_severity,
        is_compliant=is_compliant,
        suggested_title=ai_result.get("suggested_title"),
        suggested_description=ai_result.get("suggested_description"),
        suggested_improvements=ai_result.get("suggested_improvements", [])
    )
    
    db_review = crud.create_review(db, review)
    
    # Create history entry
    history = schemas.ReviewHistoryCreate(
        listing_id=listing_id,
        action="reviewed",
        original_data=listing_data,
        revised_data=None,
        user_notes=ai_result.get("overall_assessment", "Review completed"),
        user="AI"
    )
    crud.create_history_entry(db, history)
    
    return {
        "review": db_review,
        "overall_assessment": ai_result.get("overall_assessment", "Review completed"),
        "summary": {
            "total_issues": len(all_issues),
            "high_severity": len([i for i in all_issues if i.get("severity") == "high"]),
            "medium_severity": len([i for i in all_issues if i.get("severity") == "medium"]),
            "low_severity": len([i for i in all_issues if i.get("severity") == "low"]),
            "is_compliant": is_compliant
        }
    }


@app.get("/api/listings/{listing_id}/reviews", response_model=List[schemas.ReviewResponse])
def get_listing_reviews(listing_id: int, db: Session = Depends(get_db)):
    """Get all reviews for a listing"""
    return crud.get_reviews_by_listing(db, listing_id)


# ============ User Decision Endpoints ============

@app.post("/api/reviews/{review_id}/approve")
def approve_review(review_id: int, notes: str = None, db: Session = Depends(get_db)):
    """Approve review suggestions and update listing"""
    
    review = crud.get_review(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    listing = crud.get_listing(db, review.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Store original data
    original_data = {
        "title": listing.title,
        "description": listing.description,
        "status": listing.status
    }
    
    # Apply suggestions
    update_data = schemas.ListingUpdate(
        title=review.suggested_title or listing.title,
        description=review.suggested_description or listing.description,
        status="approved"
    )
    crud.update_listing(db, listing.id, update_data)
    
    # Create history entry
    history = schemas.ReviewHistoryCreate(
        listing_id=listing.id,
        action="approved",
        original_data=original_data,
        revised_data=update_data.model_dump(exclude_unset=True),
        user_notes=notes or "Review suggestions approved",
        user="user"
    )
    crud.create_history_entry(db, history)
    
    return {"message": "Review approved and listing updated", "listing_id": listing.id}


@app.post("/api/reviews/{review_id}/reject")
def reject_review(review_id: int, notes: str = None, db: Session = Depends(get_db)):
    """Reject review suggestions"""
    
    review = crud.get_review(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    listing = crud.get_listing(db, review.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Update status to rejected
    update_data = schemas.ListingUpdate(status="rejected")
    crud.update_listing(db, listing.id, update_data)
    
    # Create history entry
    history = schemas.ReviewHistoryCreate(
        listing_id=listing.id,
        action="rejected",
        original_data=None,
        revised_data=None,
        user_notes=notes or "Review suggestions rejected",
        user="user"
    )
    crud.create_history_entry(db, history)
    
    return {"message": "Review rejected", "listing_id": listing.id}


@app.post("/api/listings/{listing_id}/apply-suggestions")
def apply_custom_edits(listing_id: int, edits: dict, notes: str = None, db: Session = Depends(get_db)):
    """Apply custom user edits to a listing"""
    
    listing = crud.get_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Store original
    original_data = {
        "title": listing.title,
        "description": listing.description,
        "category": listing.category,
        "price": listing.price
    }
    
    # Apply custom edits
    update_data = schemas.ListingUpdate(**edits, status="revised")
    crud.update_listing(db, listing_id, update_data)
    
    # Create history entry
    history = schemas.ReviewHistoryCreate(
        listing_id=listing_id,
        action="edited",
        original_data=original_data,
        revised_data=edits,
        user_notes=notes or "Custom edits applied",
        user="user"
    )
    crud.create_history_entry(db, history)
    
    return {"message": "Custom edits applied", "listing_id": listing_id}


# ============ History Endpoints ============

@app.get("/api/listings/{listing_id}/history", response_model=List[schemas.ReviewHistoryResponse])
def get_listing_history(listing_id: int, db: Session = Depends(get_db)):
    """Get history for a listing"""
    return crud.get_history_by_listing(db, listing_id)


# ============ Batch Processing ============

@app.post("/api/batch/upload")
async def upload_batch_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload and process a CSV file of listings"""
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    # Read CSV
    contents = await file.read()
    csv_text = contents.decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(csv_text))
    
    results = []
    for row in csv_reader:
        try:
            # Parse attributes and tags if they're JSON strings
            attributes = json.loads(row.get('attributes', '{}')) if row.get('attributes') else {}
            tags = json.loads(row.get('tags', '[]')) if row.get('tags') else []
            
            # Create listing
            listing_data = schemas.ListingCreate(
                title=row['title'],
                description=row['description'],
                category=row['category'],
                price=float(row['price']),
                seller=row['seller'],
                attributes=attributes,
                tags=tags
            )
            
            db_listing = crud.create_listing(db, listing_data)
            
            results.append({
                "status": "success",
                "listing_id": db_listing.id,
                "title": db_listing.title
            })
            
        except Exception as e:
            results.append({
                "status": "error",
                "error": str(e),
                "row": row
            })
    
    return {
        "total": len(results),
        "successful": len([r for r in results if r["status"] == "success"]),
        "failed": len([r for r in results if r["status"] == "error"]),
        "results": results
    }


@app.post("/api/batch/review")
def batch_review_listings(listing_ids: List[int], db: Session = Depends(get_db)):
    """Review multiple listings"""
    results = []
    
    for listing_id in listing_ids:
        try:
            result = review_listing(listing_id, db)
            results.append({
                "listing_id": listing_id,
                "status": "success",
                "result": result
            })
        except Exception as e:
            results.append({
                "listing_id": listing_id,
                "status": "error",
                "error": str(e)
            })
    
    return {
        "total": len(results),
        "successful": len([r for r in results if r["status"] == "success"]),
        "failed": len([r for r in results if r["status"] == "error"]),
        "results": results
    }


# ============ Statistics Endpoints ============

@app.get("/api/stats")
def get_statistics(db: Session = Depends(get_db)):
    """Get overall statistics"""
    
    all_listings = crud.get_listings(db, skip=0, limit=10000)
    
    stats = {
        "total_listings": len(all_listings),
        "by_status": {
            "pending": len([l for l in all_listings if l.status == "pending"]),
            "approved": len([l for l in all_listings if l.status == "approved"]),
            "rejected": len([l for l in all_listings if l.status == "rejected"]),
            "revised": len([l for l in all_listings if l.status == "revised"])
        },
        "by_category": {}
    }
    
    # Count by category
    for listing in all_listings:
        category = listing.category
        stats["by_category"][category] = stats["by_category"].get(category, 0) + 1
    
    return stats


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
