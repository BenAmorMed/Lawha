# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-20 - Multi-Query Bottleneck in Admin Analytics
**Learning:** `AdminService.getOrderAnalytics` was making 6 separate database queries for total orders, status breakdown, revenue, average value, and recent order stats. By using SQL `GROUP BY` and `SUM/COUNT` aggregations, these were consolidated into just 2 queries with in-memory calculation for derived totals. Additionally, `loadRelationCountAndMap` in `getAllOrders` significantly reduced data transfer by avoiding full `OrderItem` hydration just for a count.
**Action:** Always look for `GROUP BY` opportunities in analytics modules and use `loadRelationCountAndMap` for virtual count properties in TypeORM.
