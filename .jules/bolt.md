# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-30 - Analytics Query Consolidation
**Learning:** High-traffic analytics endpoints often execute multiple `COUNT`, `SUM`, and `AVG` queries independently, causing unnecessary database roundtrips and full-table scans. Using conditional aggregation (e.g., `SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END)`) allows fetching status-specific and global metrics in a single grouped query.
**Action:** Use conditional SQL aggregation and `Promise.all` to parallelize independent query sets (like global stats vs. time-series data).
