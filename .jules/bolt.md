# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-14 - Denormalizing Product Aggregates for Read Optimization
**Learning:** High-traffic endpoints like product listing and product details benefit significantly from denormalizing aggregate statistics (average rating, total reviews) into the parent `Product` entity. This eliminates the need for SQL aggregate functions during read operations, reducing database load. The trade-off is a minor increase in write latency and the need for a synchronization mechanism in the service layer.
**Action:** Use denormalized fields for high-read aggregates and implement a private synchronization helper to keep them updated during write operations.
