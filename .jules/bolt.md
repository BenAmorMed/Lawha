# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-04-15 - Admin Analytics Optimization
**Learning:** The `AdminService.getOrderAnalytics` was executing 6 individual database queries to fetch basic summary stats, revenue, and daily distributions. These can be consolidated into 2 grouped queries (one by status, one by day) while performing final aggregations (total count, sum, average) in-memory. This significantly reduces database roundtrip latency for dashboard loading.
**Action:** Use grouped queries with `SUM` and `COUNT` aggregations to fetch multiple metrics at once whenever status-based or date-based breakdowns are needed.
