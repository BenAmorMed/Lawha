# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-03-27 - Redundant Aggregate Queries in Admin Analytics
**Learning:** `AdminService.getOrderAnalytics` was performing 6 separate database queries to gather metrics that share common filters or group-by clauses. Specifically, `total_orders`, `status_breakdown`, `revenue`, and `average_order_value` were all based on simple aggregates on the `orders` table. By grouping by `status` once, we can derive all these metrics in-memory. Similarly, `orders_last_7_days` can be derived from the result of the `orders_by_day` query.
**Action:** Always look for opportunities to consolidate aggregate queries that target the same table with similar filters into a single `GROUP BY` query.
