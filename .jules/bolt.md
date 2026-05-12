# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-12 - Consolidating Dashboard Analytics Queries
**Learning:** The `getOrderAnalytics` method was performing 6 separate database queries to calculate total count, status breakdown, revenue, average order value, and 7-day stats. These are all aggregates on the same table (`orders`). Consolidating these into two `GROUP BY` queries (one for status-based metrics and one for date-based metrics) significantly reduces database I/O and roundtrip latency.
**Action:** Always look for opportunities to combine multiple aggregate queries on the same table into a single `GROUP BY` query when building dashboards or report-style endpoints.
