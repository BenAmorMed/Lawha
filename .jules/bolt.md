# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-04-25 - Query Consolidation in Admin Analytics
**Learning:** The `AdminService.getOrderAnalytics` method was making 6 separate database calls to gather different metrics. By using `GROUP BY` and aggregate functions (`COUNT`, `SUM`, `AVG`) in TypeORM's QueryBuilder, these can be reduced to just 2 queries (one for status-based metrics and one for time-based metrics), with remaining aggregation performed in-memory.
**Action:** Always look for opportunities to consolidate multiple aggregate queries on the same table into a single grouped query.
