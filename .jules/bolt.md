# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-04-07 - Consolidated Admin Analytics Queries
**Learning:** The `AdminService.getOrderAnalytics` method was performing 6 sequential database queries, leading to unnecessary roundtrips. These can be consolidated into 2 aggregated queries (one for status-grouped stats and one for date-grouped stats), with summary metrics derived in-memory.
**Action:** Use SQL aggregation (GROUP BY) to fetch multiple metrics in a single query whenever building dashboard or analytics features.
