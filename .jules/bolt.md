# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-14 - Analytics Query Consolidation in AdminService
**Learning:** The `AdminService.getOrderAnalytics` was performing 6 separate database queries (total count, status breakdown, revenue, average value, recent count, and daily distribution). These could be consolidated into 2 grouped queries (one for status-based metrics and one for date-based distribution) by using SQL aggregation functions like `SUM`, `COUNT`, and `AVG` with `GROUP BY`.
**Action:** Always look for opportunities to use `GROUP BY` and aggregate functions to fetch multiple metrics in a single database roundtrip.
