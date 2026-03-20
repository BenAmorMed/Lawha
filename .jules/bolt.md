# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-03-20 - Denormalized Product Ratings
**Learning:** Performing AVG and COUNT aggregate queries on the Review table for every product list or detail view is a significant performance bottleneck as the number of reviews grows. Denormalizing these aggregates into the Product entity allows for O(1) retrieval.
**Action:** Implement sync logic in the Reviews service to update Product stats on every review change and use these denormalized values in read paths.
