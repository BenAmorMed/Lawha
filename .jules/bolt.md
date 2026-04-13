# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-04-13 - Redundant Dashboard Analytics Queries
**Learning:** The `AdminService.getOrderAnalytics` was performing 6 separate database queries to populate a single dashboard view. By grouping queries by `status` and `date`, these were consolidated into 2 queries, with secondary metrics (revenue, averages) calculated in-memory from the grouped results.
**Action:** Always check if multiple dashboard metrics can be aggregated into a single grouped query.
