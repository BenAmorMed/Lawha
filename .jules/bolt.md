# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-15 - Consolidating Dashboard Analytics
**Learning:** The `AdminService.getOrderAnalytics` was performing 6 separate database roundtrips to calculate various summary metrics. These can be consolidated into 2 grouped queries (one for status-based totals and one for daily time-series) by performing the final aggregation in-memory. This significantly reduces database overhead for high-traffic dashboards.
**Action:** Look for opportunities to replace multiple `.count()` or `.getRawOne()` calls on the same table with a single grouped `.getRawMany()` call.
