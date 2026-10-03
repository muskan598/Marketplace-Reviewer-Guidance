# Marketplace Listing Quality Reviewer

A comprehensive AI-powered marketplace listing review and validation system that helps ensure product listings meet quality standards and marketplace policies.

## 🎯 Project Overview

This application reviews marketplace product/service listings using both deterministic validation rules and AI-powered content analysis. It helps sellers create compliant, high-quality listings by:

- **Validating** required fields, formats, and business rules
- **Analyzing** content against marketplace policies using AI
- **Suggesting** improvements to titles and descriptions
- **Tracking** review history and user decisions
- **Supporting** batch processing via CSV upload

## 🏗️ Architecture

### Backend (Python FastAPI)
- **Framework**: FastAPI for high-performance REST API
- **Database**: SQLite for data persistence
- **AI Integration**: Anthropic Claude for intelligent content review
- **Validation**: Custom deterministic rules + AI-powered analysis

### Frontend (React + Vite)
- **Framework**: React 18 with Vite for fast development
- **Styling**: Tailwind CSS for modern, responsive UI
- **Routing**: React Router for navigation
- **API Client**: Axios for HTTP requests

### Database Schema
- **Listings**: Product/service listing data
- **Reviews**: AI and validation review results
- **ReviewHistory**: Complete audit trail of all actions

## 📋 Features Implemented

### ✅ Core Features
- [x] Create individual listings with full validation
- [x] Deterministic validation (required fields, formats, lengths)
- [x] AI-powered content review against policies
- [x] Issue detection with severity classification (Low/Medium/High)
- [x] AI-generated title and description suggestions
- [x] User decision workflow (Approve/Reject/Edit)
- [x] Review history tracking
- [x] Batch CSV upload for multiple listings
- [x] Statistics dashboard

### ✅ Validation Rules
- Required field validation
- Title length (10-200 characters)
- Description length (20+ characters)
- Supported category validation
- Price format and range validation
- Duplicate listing detection

### ✅ AI Analysis
- Policy compliance checking
- Content clarity assessment
- Misleading claim detection
- Unverifiable content identification
- Writing quality evaluation
- Improvement suggestions with explanations

### ✅ User Interface
- Modern, responsive dashboard
- Listing creation form
- Interactive review interface
- Side-by-side comparison (original vs. suggested)
- Edit mode for custom modifications
- Batch upload with CSV template
- Complete history timeline

## 🚀 Setup Instructions

### Prerequisites
- Python 3.9+ installed
- Node.js 18+ installed
- Git installed
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
```

3. **Activate virtual environment**:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

4. **Install dependencies**:
```bash
pip install -r requirements.txt
```

5. **Configure environment**:
```bash
copy .env.example .env
```
Edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

6. **Run the backend server**:
```bash
cd app
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory** (open new terminal):
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Quick Start

After both servers are running:

1. Open browser to `http://localhost:5173`
2. Click "Create Listing" in sidebar
3. Fill in product details
4. Click "Create Listing"
5. Review validation results and AI suggestions
6. Approve, reject, or edit the suggestions

## 📁 Project Structure

```
marketplace-reviewer/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application
│   │   ├── models.py            # Database models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── database.py          # Database connection
│   │   ├── crud.py              # Database operations
│   │   ├── validation.py        # Deterministic validation
│   │   ├── ai_reviewer.py       # AI integration
│   │   └── policies/
│   │       ├── marketplace_policy.md
│   │       └── content_guide.md
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/              # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateListing.jsx
│   │   │   ├── ReviewListing.jsx
│   │   │   ├── ListingHistory.jsx
│   │   │   └── BatchUpload.jsx
│   │   ├── services/
│   │   │   └── api.js          # API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── README.md
├── AGENT_USAGE.md
└── .gitignore
```

## 🧪 Testing the Application

### Test Scenario 1: Create and Review a Listing
1. Go to "Create Listing"
2. Enter:
   - Title: "Great phone"
   - Description: "Nice"
   - Category: Electronics
   - Price: 299.99
   - Seller: TestSeller
3. Submit and observe validation errors (title too short, description too short)

### Test Scenario 2: Successful Review
1. Create listing with proper data:
   - Title: "Samsung Galaxy S23 Ultra 256GB Unlocked"
   - Description: "Brand new Samsung Galaxy S23 Ultra with 256GB storage. Features stunning 6.8-inch display, powerful camera system, and S Pen support. Unlocked for all carriers. Includes original box and accessories."
   - Category: Electronics
   - Price: 899.99
   - Seller: TechStore
2. Click "Start Review"
3. View AI analysis and suggestions
4. Approve or edit suggestions

### Test Scenario 3: Batch Upload
1. Download CSV template
2. Add multiple listings
3. Upload file
4. Review import results

## 📊 API Endpoints

### Listings
- `POST /api/listings` - Create new listing
- `GET /api/listings` - Get all listings
- `GET /api/listings/{id}` - Get specific listing
- `GET /api/listings/{id}/full` - Get listing with review and history
- `PUT /api/listings/{id}` - Update listing
- `DELETE /api/listings/{id}` - Delete listing

### Reviews
- `POST /api/listings/{id}/review` - Review a listing
- `GET /api/listings/{id}/reviews` - Get all reviews for listing
- `POST /api/reviews/{id}/approve` - Approve review suggestions
- `POST /api/reviews/{id}/reject` - Reject review suggestions
- `POST /api/listings/{id}/apply-suggestions` - Apply custom edits

### Batch Operations
- `POST /api/batch/upload` - Upload CSV file
- `POST /api/batch/review` - Review multiple listings

### History & Stats
- `GET /api/listings/{id}/history` - Get listing history
- `GET /api/stats` - Get statistics

## 🔧 Configuration

### Supported Categories
- Electronics
- Clothing
- Home & Garden
- Sports & Outdoors
- Books
- Toys & Games
- Health & Beauty
- Automotive
- Food & Beverages
- Pet Supplies
- Office Supplies
- Music & Movies

### Validation Rules
- Title: 10-200 characters
- Description: 20+ characters (no maximum enforced)
- Price: $0.01 - $1,000,000
- Category: Must be from supported list

## 🚫 Scope Limitations

**Intentionally excluded** (as per requirements):
- ❌ Publishing to real marketplaces
- ❌ Image moderation
- ❌ Payment processing
- ❌ Seller verification
- ❌ Unrestricted product categories
- ❌ Multi-user authentication
- ❌ Real-time notifications

## 🐛 Known Issues & Limitations

1. **API Key Required**: Application requires Anthropic API key to function
2. **Single User**: No authentication system (single-user application)
3. **Local Database**: SQLite database stored locally
4. **No Image Support**: Text-only analysis
5. **Synchronous Reviews**: Reviews processed one at a time

## 🔒 Security Notes

- Never commit `.env` file to version control
- Keep Anthropic API key secure
- Use environment variables for all secrets
- CORS configured for development (restrict in production)

## 📦 Deployment

### Backend Deployment (Recommended: Railway, Render, or Heroku)

1. Set environment variables:
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL` (if using PostgreSQL)

2. Update CORS origins in `main.py` to include your frontend URL

### Frontend Deployment (Recommended: Vercel, Netlify)

1. Build the frontend:
```bash
npm run build
```

2. Update API base URL in `src/services/api.js` to your backend URL

3. Deploy the `dist` folder

## 📝 License

This is an educational project for assessment purposes.

## 👥 Support

For issues or questions, refer to the codebase comments and documentation.
