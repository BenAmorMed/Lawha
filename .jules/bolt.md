# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-03-15 - Missing Denormalization Sync
**Learning:** The `Product` entity contained `rating` and `reviewsCount` fields intended for denormalization, but the `ReviewsService` was not updating them on review changes, nor was it using them for reads. This led to expensive `AVG` and `COUNT` aggregations on every product list and detail view.
**Action:** Always implement a synchronization mechanism (like `updateProductStats`) when using denormalized fields to ensure data consistency and enable high-performance reads.
