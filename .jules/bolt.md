# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-07-06 - Optimized Admin Analytics Waterfall
**Learning:** The `AdminService.getOrderAnalytics` method exhibited a 'sequential query waterfall' anti-pattern, executing 6 independent database queries one after another. This significantly increased latency for the admin dashboard as the database scale grows. Additionally, `getAllOrders` was performing separate `COUNT` and `SELECT` queries despite TypeORM's `getManyAndCount` being able to handle both in a more efficient manner.
**Action:** Consolidate independent summary statistics into a single query using conditional aggregation (e.g., `SUM(CASE WHEN...)`), parallelize remaining independent queries using `Promise.all`, and use `getManyAndCount` for paginated results to reduce total database roundtrips.
