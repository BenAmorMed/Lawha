# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-07-03 - Inefficient Admin Analytics Aggregation
**Learning:** `AdminService.getOrderAnalytics` was performing six sequential database queries to calculate dashboard metrics (total count, status breakdown, revenue, average value, recent orders, and daily trends). Many of these metrics could be derived from the same result set if queried using grouped conditional aggregation.
**Action:** Consolidate multiple summary queries into a single grouped query using `SUM(CASE WHEN ...)` and execute remaining queries in parallel with `Promise.all` to minimize database roundtrips.
