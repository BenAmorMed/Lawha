# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-07-02 - Efficient Aggregation and Relation Counting
**Learning:** Sequential queries for basic statistics (count, sum, avg) are a major bottleneck. Consolidating these into a single query using conditional aggregation (`SUM(CASE WHEN ... THEN 1 ELSE 0 END)`) and `groupBy` reduces database roundtrips from O(N) to O(1) for N metrics. Additionally, using `loadRelationCountAndMap` in TypeORM prevents fetching large related objects when only their count is required, significantly reducing memory usage and transfer time.
**Action:** Always look for opportunities to use SQL-level aggregation for dashboard-style analytics and use `loadRelationCountAndMap` for metadata in list endpoints.
