# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-03-16 - Denormalization of Product Review Stats
**Learning:** Performing aggregate queries (AVG, COUNT) on every product fetch or review list request is expensive. Denormalizing these stats into the `Product` entity and updating them asynchronously or on-write significantly improves read performance for high-traffic pages like Product Listing and Product Details.
**Action:** Use denormalized fields for frequently accessed aggregate data and maintain them via lifecycle hooks or internal helpers like `updateProductStats`.
