# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-15 - Denormalization and Persistent Indexing
**Learning:** Performing aggregate calculations (AVG, COUNT) on-the-fly during product listings is a scalability bottleneck. Persisting these values in the `Product` entity and synchronizing them during review write operations (create, update, delete) transforms O(N) aggregate queries into O(1) property lookups. Additionally, catalog filtering and sorting rely heavily on `category`, `currentPrice`, and `createdAt`, which must be indexed to maintain performance.
**Action:** Use denormalization for frequently accessed aggregates and ensure all catalog-level filter/sort fields are indexed.
