# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-03-30 - Consolidation of Analytics Queries
**Learning:** The `AdminService.getOrderAnalytics` was making 6 separate database roundtrips to calculate various metrics (total count, status breakdown, revenue, avg value, 7-day total, and daily breakdown). By grouping by status and date respectively, these can be reduced to exactly 2 roundtrips. In-memory aggregation of these grouped results is significantly faster than multiple specialized SQL queries for a dashboard with low-to-medium volume.
**Action:** Always look for opportunities to consolidate multiple aggregate queries on the same table by using broader groupings and post-processing in-memory.
