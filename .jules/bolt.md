# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-15 - Consolidating Dashboard Aggregates
**Learning:** Dashboard analytics methods like `AdminService.getOrderAnalytics` often start as a collection of separate `COUNT`, `SUM`, and `AVG` queries. This leads to excessive database roundtrips. These can almost always be consolidated into status-grouped or date-grouped queries with in-memory accumulation.
**Action:** Prioritize grouping by category/status/date to fetch multiple aggregates in a single result set instead of making individual query calls.
