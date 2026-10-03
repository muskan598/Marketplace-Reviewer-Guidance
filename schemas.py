"""
Pydantic Schemas - Defines data validation and API request/response formats

Schemas are like contracts that define:
- What data the API expects to receive
- What data the API will send back
- How to validate that data
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============ Listing Schemas ============

class ListingBase(BaseModel):
    """Base schema with common listing fields"""
    title: str = Field(..., min_length=10, max_length=200, description="Product title")
    description: str = Field(..., min_length=20, description="Detailed product description")
    category: str = Field(..., description="Product category")
    price: float = Field(..., gt=0, description="Product price (must be positive)")
    seller: str = Field(..., min_length=2, description="Seller name or ID")
    attributes: Optional[Dict[str, Any]] = Field(default={}, description="Additional product attributes")
    tags: Optional[List[str]] = Field(default=[], description="Optional product tags")


class ListingCreate(ListingBase):
    """Schema for creating a new listing"""
    pass


class ListingUpdate(BaseModel):
    """Schema for updating an existing listing (all fields optional)"""
    title: Optional[str] = Field(None, min_length=10, max_length=200)
    description: Optional[str] = Field(None, min_length=20)
    category: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    seller: Optional[str] = Field(None, min_length=2)
    attributes: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None


class ListingResponse(ListingBase):
    """Schema for returning listing data"""
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allows converting SQLAlchemy models to Pydantic


# ============ Review Issue Schemas ============

class ValidationIssue(BaseModel):
    """Represents a deterministic validation error"""
    field: str
    issue: str
    severity: str  # low, medium, high
    suggestion: Optional[str] = None


class AIFinding(BaseModel):
    """Represents an AI-detected content issue"""
    field: str
    issue: str
    severity: str  # low, medium, high
    policy_reference: str
    suggested_fix: str
    explanation: str


# ============ Review Schemas ============

class ReviewCreate(BaseModel):
    """Schema for creating a review"""
    listing_id: int
    deterministic_issues: List[Dict[str, Any]] = []
    ai_findings: List[Dict[str, Any]] = []
    overall_severity: str
    is_compliant: bool
    suggested_title: Optional[str] = None
    suggested_description: Optional[str] = None
    suggested_improvements: List[Dict[str, Any]] = []


class ReviewResponse(BaseModel):
    """Schema for returning review data"""
    id: int
    listing_id: int
    deterministic_issues: List[Dict[str, Any]]
    ai_findings: List[Dict[str, Any]]
    overall_severity: str
    is_compliant: bool
    suggested_title: Optional[str]
    suggested_description: Optional[str]
    suggested_improvements: List[Dict[str, Any]]
    reviewed_at: datetime
    reviewer: str

    class Config:
        from_attributes = True


# ============ Review History Schemas ============

class ReviewHistoryCreate(BaseModel):
    """Schema for creating a history entry"""
    listing_id: int
    action: str
    original_data: Optional[Dict[str, Any]] = None
    revised_data: Optional[Dict[str, Any]] = None
    user_notes: Optional[str] = None
    user: str = "system"


class ReviewHistoryResponse(BaseModel):
    """Schema for returning history data"""
    id: int
    listing_id: int
    action: str
    original_data: Optional[Dict[str, Any]]
    revised_data: Optional[Dict[str, Any]]
    user_notes: Optional[str]
    timestamp: datetime
    user: str

    class Config:
        from_attributes = True


# ============ User Action Schemas ============

class UserDecision(BaseModel):
    """Schema for user approval/rejection decisions"""
    listing_id: int
    review_id: int
    action: str = Field(..., pattern="^(approve|reject|edit)$")
    notes: Optional[str] = None
    revised_data: Optional[Dict[str, Any]] = None


class BatchReviewRequest(BaseModel):
    """Schema for batch processing multiple listings"""
    listings: List[ListingCreate]


class BatchReviewResponse(BaseModel):
    """Schema for batch review results"""
    total: int
    processed: int
    failed: int
    results: List[Dict[str, Any]]


# ============ Complete Listing with Review Schema ============

class ListingWithReview(BaseModel):
    """Complete listing data including its latest review"""
    listing: ListingResponse
    review: Optional[ReviewResponse]
    history: List[ReviewHistoryResponse]

    class Config:
        from_attributes = True
