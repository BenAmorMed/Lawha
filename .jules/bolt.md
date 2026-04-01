# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` according to TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-15 - Consolidated Analytics Queries
**Learning:** The `AdminService.getOrderAnalytics` method was performing six separate database queries for metrics (total, status breakdown, revenue, AOV, recent count, and daily breakdown). These can be consolidated into exactly two aggregate queries (one status-grouped and one date-grouped) while deriving all other summary metrics in-memory.
**Action:** Always look for opportunities to use `GROUP BY` and aggregate functions (`COUNT`, `SUM`, `AVG`) in a single query to replace multiple individual metric lookups.
