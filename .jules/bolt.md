# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-14 - Redundant Analytics Queries in Admin Module
**Learning:** The `AdminService.getOrderAnalytics` method was performing six separate database queries for operations that could be optimized into two by using SQL aggregation and grouping. Consolidating total count, revenue, average order value, and status breakdown into a single status-grouped query, and daily stats into a second date-grouped query, significantly reduces database roundtrips and table scans.
**Action:** Always prefer grouped aggregate queries for multi-metric dashboards instead of multiple individual queries. Perform global calculations in-memory from these aggregate results.
