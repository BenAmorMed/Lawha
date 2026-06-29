# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-29 - Consolidating Dashboard Analytics Queries
**Learning:** The `AdminService.getOrderAnalytics` was performing six separate database queries sequentially. By using conditional aggregation in a single query (e.g., `SUM(CASE WHEN order.createdAt >= :date THEN 1 ELSE 0 END)`) and parallel execution with `Promise.all`, the roundtrips were reduced to two.
**Action:** Always look for opportunities to use SQL conditional aggregation for dashboard-like statistics instead of multiple targeted queries.
