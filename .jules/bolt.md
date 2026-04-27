# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-04-27 - Admin Analytics Optimization
**Learning:** The `getOrderAnalytics` method was performing 6 sequential database roundtrips for metrics that could be consolidated. By using SQL aggregations (`SUM`, `COUNT`) and `GROUP BY` clauses, 4 summary metrics (total orders, status breakdown, revenue, and average order value) were reduced to a single query, and 2 recent order metrics were reduced to another.
**Action:** Consolidate multiple summary statistics into single grouped queries whenever possible to reduce database pressure and network latency.
