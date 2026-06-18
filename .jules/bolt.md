# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-18 - Risky Service-Layer Optimization
**Learning:** Attempted to "optimize" a service by reusing a count from a filtered query to populate global product stats. This was rejected because it would lead to incorrect summary data if list filters were ever applied to the main query. Global stats should remain independent of UI-driven result filters.
**Action:** Prioritize correctness over micro-optimizations. Always ensure that values being reused across logical boundaries (like page summary vs. paginated results) represent the same data set.
