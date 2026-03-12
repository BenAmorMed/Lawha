# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-15 - Denormalization of Product Statistics
**Learning:** Performing `AVG` and `COUNT` aggregate queries on the `reviews` table for every product listing/detail view is expensive. Denormalizing these values into the `products` table allows for O(1) retrieval during reads. However, this requires careful synchronization in the `ReviewsService` write paths (create, update, delete) to maintain consistency.
**Action:** Use denormalization for frequently accessed aggregate data, ensuring synchronization helpers are called in all modification paths.
