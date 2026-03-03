# Phase 8: Customer Reviews & Ratings - Implementation Guide

## Overview

The Customer Reviews & Ratings system allows customers to share feedback on products they've purchased, provides social proof, and helps other customers make informed decisions.

## Architecture

### Backend Components

#### 1. Review Entity (`backend/src/reviews/review.entity.ts`)

```typescript
@Entity('reviews')
export class Review {
  id: string (UUID);
  rating: number (1-5);
  title: string (5-100 chars);
  comment: string (10-1000 chars);
  user_id: UUID;
  product_id: UUID;
  order_id?: UUID (optional - for verified purchases);
  verified_purchase: boolean;
  helpful_count: number;
  helpful_by: UUID[] (array of users who marked helpful);
  created_at: Date;
  updated_at: Date;
}
```

#### 2. Review Service (`backend/src/reviews/reviews.service.ts`)

**Key Methods:**

```typescript
// Create a new review for a product
async createReview(userId: string, dto: CreateReviewDto): Promise<Review>
// - Checks user hasn't already reviewed product
// - Verifies product exists
// - Auto-detects verified purchase from order
// - Prevents duplicate reviews

// Get reviews for a product
async getProductReviews(
  productId: string,
  limit?: number,
  offset?: number,
  sortBy?: 'helpful' | 'recent' | 'rating'
): Promise<{
  reviews: Review[],
  pagination: {...},
  product_rating: { average, total }
}>
// - Returns paginated reviews
// - Calculates average rating
// - Sorts by helpful/recent/rating

// Get user's own reviews
async getUserReviews(userId, limit, offset): Promise<Review[]>

// Get review details
async getReviewById(reviewId: string): Promise<Review>

// Update review (owner only)
async updateReview(reviewId, userId, dto): Promise<Review>

// Delete review (owner only)
async deleteReview(reviewId, userId): Promise<void>

// Mark review as helpful
async markHelpful(reviewId, userId): Promise<Review>
// - Prevents duplicate helpful marks from same user
// - Increments helpful_count

// Get product rating statistics
async getProductStats(productId): Promise<{
  average_rating: number,
  total_reviews: number,
  rating_distribution: Record<1-5, number>
}>
// - Rating breakdown by star count
// - Useful for product display
```

#### 3. Review Controller (`backend/src/reviews/reviews.controller.ts`)

**Endpoints:**

```
POST   /api/v1/reviews
- Requires: JWT authentication
- Body: { rating, title, comment, product_id, order_id? }
- Returns: Created review

GET    /api/v1/reviews/product/:productId
- Query: limit, offset, sortBy
- Returns: Paginated reviews with product rating

GET    /api/v1/reviews/product/:productId/stats
- Returns: Rating stats and distribution

GET    /api/v1/reviews/my-reviews
- Requires: JWT authentication
- Query: limit, offset
- Returns: User's reviews

GET    /api/v1/reviews/:id
- Returns: Full review details

PATCH  /api/v1/reviews/:id
- Requires: JWT + ownership
- Body: { rating?, title?, comment? }
- Returns: Updated review

DELETE /api/v1/reviews/:id
- Requires: JWT + ownership
- Returns: Success message

POST   /api/v1/reviews/:id/helpful
- Requires: JWT authentication
- Returns: Updated review with new helpful count
```

### Frontend Components

#### 1. Reviews API Client (`frontend/src/api/reviews-api.ts`)

```typescript
reviewsApi = {
  createReview(data): Promise<Review>,
  getProductReviews(productId, limit, offset, sortBy): Promise<{reviews, pagination, product_rating}>,
  getProductStats(productId): Promise<ProductStats>,
  getUserReviews(limit, offset): Promise<{reviews, pagination}>,
  updateReview(reviewId, data): Promise<Review>,
  deleteReview(reviewId): Promise<void>,
  markHelpful(reviewId): Promise<Review>
}
```

#### 2. Review Form Component (`frontend/src/components/reviews/ReviewForm.tsx`)

**Features:**
- Star rating selector (1-5)
- Review title input (5-100 chars, with character counter)
- Review comment textarea (10-1000 chars, with character counter)
- Submit for authenticated users
- Redirects to login for unauthenticated
- Error handling and loading states
- Form validation before submission

**Validation:**
```
- Rating: 1-5 (required)
- Title: 5-100 characters (required)
- Comment: 10-1000 characters (required)
- Product ID: UUID (required)
- Order ID: UUID (optional, for verified purchase)
```

#### 3. Reviews List Component (`frontend/src/components/reviews/ReviewsList.tsx`)

**Features:**
- Displays all product reviews
- Rating summary with average and breakdown
- Sort options: Recent, Most Helpful, Highest Rating
- Verified purchase badge
- Review helpful counter with mark button
- Author name and timestamp
- Star rating display for each review
- Loading, error, and empty states

**Displays:**
```
Summary Section
├── Average rating (0-5)
├── Total review count
├── Star rating breakdown (5→1)
└── Percentage for each rating

Reviews List
├── Star rating
├── Verified purchase badge (if applicable)
├── Title
├── Author + date
├── Comment text
└── Helpful counter button
```

#### 4. Product Reviews Page (`frontend/src/app/products/[id]/reviews/page.tsx`)

**Features:**
- Review form for authenticated users
- Reviews list with statistics
- Guidelines sidebar with review tips
- Link to user's review history
- Back button to product
- Responsive layout (main content + sidebar)

#### 5. My Reviews Page (`frontend/src/app/reviews/my-reviews/page.tsx`)

**Features:**
- View all your reviews in one place
- Edit and delete buttons for each review
- Product link for context
- Creation vs update timestamps
- Empty state with CTA to browse products
- Loading and error states

## Database Schema

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(100) NOT NULL,
  comment TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  helpful_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, product_id) -- One review per product per user
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_helpful ON reviews(helpful_count DESC);
```

## Feature Details

### Verified Purchase Badge

Reviews linked to customer's orders show "Verified Purchase" badge:
```
1. Customer leaves review with order_id
2. System finds order in customer's order history
3. Checks if order contains the product being reviewed
4. Sets verified_purchase = true
5. Badge displays in review list
```

### Helpful Counter

Tracks which customers found a review helpful:
```
- Each user can mark a review as helpful once
- Prevents duplicate marks with helpful_by array
- Helpful_count used for sorting "Most Helpful"
- Encourages quality reviews
```

### One Review Per Product Per User

```
- User can only have 1 review per product
- Attempting duplicate raises error "You have already reviewed this product"
- User must update existing review instead
- Prevents review spam
```

### Rating Distribution

```
Shows breakdown of reviews by star count:
5 stars: ████ 40 (40%)
4 stars: ███  30 (30%)
3 stars: ██   20 (20%)
2 stars: █    8 (8%)
1 stars: █    2 (2%)

Total: 100 reviews
Average: 4.0 stars
```

## Integration Points

### Order History Integration
- Link "Add Review" button from order detail page
- Pre-select product and order_id for verified purchase
- Show "Write a Review" CTA in successful order emails

### Product Pages
- Display average rating and review count
- Show top/recent reviews
- "Read All Reviews" link to full reviews page
- "Write a Review" button (for logged-in users)

### Customer Dashboard
- "My Reviews" section showing user's reviews
- Link to manage all reviews
- Notification when review gets marked helpful

### Admin Dashboard
- Monitor review activity
- Flag suspicious/inappropriate reviews (future)
- Respond to reviews (future)

## Business Logic

### Review Validation

```typescript
// At creation:
1. User authenticated ✓
2. Product exists ✓
3. User hasn't reviewed this product ✓
4. Rating 1-5 ✓
5. Title 5-100 chars ✓
6. Comment 10-1000 chars ✓
7. If order_id provided:
   a. Order belongs to user ✓
   b. Order contains product ✓
   c. Set verified_purchase = true ✓

// At update:
1. User owns review ✓
2. Same validation as creation ✓

// At delete:
1. User owns review ✓

// At mark helpful:
1. User authenticated ✓
2. User hasn't marked as helpful before ✓
3. Increment counter ✓
```

### Sorting Behavior

```
Recent (default)
- ORDER BY created_at DESC
- Shows newest reviews first
- Good for customers making decisions

Most Helpful
- ORDER BY helpful_count DESC
- Shows most useful reviews first
- Rewards good reviews

Highest Rating
- ORDER BY rating DESC
- Shows 5-star reviews first
- Shows positive sentiment first
```

## Testing Checklist

### Review Creation
- [ ] Submit review with all fields
- [ ] Validate character limits enforced
- [ ] Prevent duplicate review for same product
- [ ] Auto-detect verified purchase from order
- [ ] Show error for non-existent product
- [ ] Require auth to create review

### Review Display
- [ ] Load product reviews with pagination
- [ ] Calculate average rating correctly
- [ ] Show rating distribution accurately
- [ ] Display verified purchase badge
- [ ] Format dates correctly
- [ ] Show author name (or hide for privacy)

### Review Management
- [ ] User can edit their review
- [ ] User can delete their review
- [ ] Non-owner cannot edit/delete
- [ ] Mark as helpful increments counter
- [ ] Prevent double-marking helpful
- [ ] Sorting works correctly

### My Reviews Page
- [ ] List all user reviews
- [ ] Show product link for each
- [ ] Edit button navigates to form
- [ ] Delete asks for confirmation
- [ ] Empty state shows helpful message
- [ ] Redirect non-auth users to login

### Admin Features
- [ ] View all reviews in system
- [ ] See review statistics
- [ ] Filter by product/user
- [ ] Flag inappropriate reviews (future)

## Security Considerations

### Authorization

✅ **Current:**
- Only review owner can edit/delete their review
- JWT authentication required for sensitive operations
- Product exists validation prevents invalid references

⚠️ **Future Enhancements:**
- Moderate inappropriate reviews
- Flag spam/fake reviews
- Review voting/reputation system
- Admin review responses

### Data Privacy

✅ **Current:**
- User email shown on reviews (consider hiding for privacy)
- Order links never exposed to public
- No sensitive order data in reviews

⚠️ **Future Considerations:**
- Option to hide reviewer name
- Anonymous reviews for privacy
- GDPR: Right to be forgotten

### Rate Limiting

⚠️ **Not Implemented:**
- Limit review creation per user per day
- Prevent review bombing attacks
- Suspicious pattern detection

## Performance Optimization

### Queries Optimized

```
- Index on (product_id, created_at) for product reviews
- Index on (user_id) for user reviews
- Index on (helpful_count DESC) for sorting
- COUNT() aggregation for stats
- AVG() for rating calculations
```

### Caching Opportunities

```
- Cache product rating stats
- Cache top reviews per product
- Invalidate on new review/helpful mark
```

### Future Enhancements

- [ ] Elasticsearch for review search
- [ ] Redis cache for product stats
- [ ] Batch helpful_by updates
- [ ] Denormalize average_rating on Product table

## Troubleshooting

### "You have already reviewed this product"
- User can only have 1 review per product
- Solution: Edit existing review instead of creating new

### "Cannot mark as helpful"
- You already marked this review as helpful
- Solution: Cannot change helpful once marked

### "You can only edit your own reviews"
- Trying to edit someone else's review
- Solution: Review only your own reviews

### Missing verified purchase badge
- Order ID not provided with review
- Order doesn't contain this product
- Solution: Check order ID is correct

## Analytics & Metrics

### Key Metrics to Track

1. **Review Volume**
   - Reviews per product
   - Reviews per user
   - Daily/weekly review rate

2. **Rating Distribution**
   - Average rating by product
   - 5-star vs negative review ratio
   - Rating trends over time

3. **Engagement**
   - % of reviews marked helpful
   - Helpful counter distribution
   - Most helpful reviews

4. **User Behavior**
   - Reviews per active user
   - Update frequency
   - Time to first review after purchase

### Dashboard

Could add admin metrics view showing:
- Top-rated products
- Products with most reviews
- Trending products by review count
- Recent successful reviews
- Flagged reviews awaiting moderation

## Future Enhancements (Phase 8+)

### Review Moderation
- [ ] Flag inappropriate content
- [ ] Admin review approval workflow
- [ ] Auto-filter spam keywords
- [ ] Suspicious pattern detection

### Enhanced Features
- [ ] Review images/videos
- [ ] Review comments/responses
- [ ] Admin responses to reviews
- [ ] Review categories (quality, shipping, etc.)
- [ ] Helpful/unhelpful vote (not just helpful)

### Social Features
- [ ] Share reviews on social media
- [ ] Follow specific reviewers
- [ ] Reviewer reputation/badges
- [ ] Review upvoting system
- [ ] Review collections/lists

### Recommendations
- [ ] Product recommendations based on 5-star reviews
- [ ] Similar products to highly-rated items
- [ ] "Customers who loved this also liked..."
- [ ] Personalized product suggestions

### Analytics
- [ ] Sentiment analysis on review text
- [ ] Natural language processing
- [ ] Review trends and seasonality
- [ ] Predict product success from early reviews
- [ ] Correlate reviews with sales

## Deployment Checklist

- [ ] ReviewsModule imported in AppModule
- [ ] Review entity registered in TypeORM
- [ ] Database migration created and run
- [ ] Indexes created on reviews table
- [ ] API endpoints returning correct status codes
- [ ] Error handling works for edge cases
- [ ] Frontend components render correctly
- [ ] Images/reviews load with expected latency
- [ ] Review creation throttling configured (if needed)
- [ ] Email notification on review (optional)
- [ ] Admin notifications for flagged reviews (future)

## Summary

**Phase 8: Customer Reviews & Ratings** is a complete social proof and feedback system:

✅ **Features**
- Create, read, update, delete reviews
- Verified purchase badges
- Rating statistics and distribution
- Sort by recent/helpful/rating
- Mark reviews as helpful
- One review per product per user
- Comprehensive product statistics

✅ **Security**
- JWT authentication for sensitive operations
- Ownership verification for edits/deletes
- Validated input constraints
- Product existence checks

✅ **User Experience**
- Intuitive review form
- Clear rating system
- Helpful counter
- My reviews dashboard
- Product-specific review pages

**Status**: ✅ PHASE 8 COMPLETE - Customer Reviews & Ratings System

**Next Phases Could Include:**
- Phase 9: Review Moderation & Admin Tools
- Phase 9: SMS Notifications & Reminders
- Phase 9: Inventory Management System
- Phase 10: Mobile App
- Phase 10: Advanced Analytics & Reporting
