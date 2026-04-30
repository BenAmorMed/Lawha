# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-04-30 - Redundant Frontend API Calls for Denormalized Data
**Learning:** The `GalleryPage` was making an additional network request to `reviewsApi.getMultipleProductStats` to fetch rating information that was already present in the `products` list response. Denormalized fields like `rating` and `reviewsCount` in the `Product` entity are designed to optimize these views.
**Action:** Before implementing additional API calls for related data, verify if the primary API response already includes denormalized versions of that data.
