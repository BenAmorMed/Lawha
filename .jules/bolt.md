# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-14 - Redundant Aggregate Queries in Reviews
**Learning:** The frontend was making two separate API calls (`getProductReviews` and `getProductStats`) to display the same logical entity (reviews and their summary). Furthermore, the backend was performing a redundant `AVG`/`COUNT` query inside `getProductReviews` despite having a more optimized `getProductStats` method available. Consolidating these into a single response and using `Promise.all` on the backend reduces both network latency and database overhead.
**Action:** Always check if multiple related data points can be served by a single enriched endpoint, especially for summary/detail views.
