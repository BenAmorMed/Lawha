# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-16 - Consolidation of Aggregate Analytics Queries
**Learning:** The `AdminService.getOrderAnalytics` method was making 6 separate database calls for metrics that could be grouped. Consolidating these into 2 grouped queries (one for status-based metrics and one for time-based metrics) significantly reduces database roundtrips. Additionally, using `getManyAndCount()` in paginated results is a cleaner and more efficient pattern than separate `getCount()` and `getMany()` calls.
**Action:** Always look for opportunities to group aggregate queries (COUNT, SUM, AVG) by a shared dimension (like status or date) to fetch multiple metrics in one go.
