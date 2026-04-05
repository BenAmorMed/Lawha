# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-04-05 - Admin Analytics Query Bottleneck
**Learning:** The `AdminService.getOrderAnalytics` method was performing 6 separate database roundtrips to fetch summary metrics, status breakdowns, and daily counts. This can be consolidated into just 2 queries: one grouped by status (for global counts, sums, and averages) and one grouped by date (for daily trends). Aggregating global totals in-memory from the status-grouped result is significantly faster than multiple `COUNT`, `SUM`, and `AVG` calls across the network.
**Action:** Consolidate multiple aggregate queries into status-grouped queries and derive global metrics in-memory.
