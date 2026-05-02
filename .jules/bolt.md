# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-02 - Consolidating Analytics Queries
**Learning:** The `AdminService.getOrderAnalytics` method was performing 6 separate database queries to calculate metrics that could be derived from just 2 grouped queries. Specifically, metrics like total orders, revenue, and average order value can all be calculated in-memory from a single query grouped by status. Similarly, total orders in the last 7 days can be calculated by summing the results of a daily breakdown query.
**Action:** Always look for opportunities to use `GROUP BY` and in-memory aggregation to reduce database roundtrips in dashboard/analytics endpoints.
