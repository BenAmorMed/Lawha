# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-06 - Optimized Admin Analytics Query Performance
**Learning:** The `AdminService.getOrderAnalytics` method was performing 6 separate database queries (total count, status breakdown, revenue, average value, recent count, daily distribution). By using grouped queries and in-memory aggregation, this can be reduced to just 2 database queries without changing the response format.
**Action:** Consolidate multiple scalar/grouped queries into a single grouped query when they target the same table with similar filters.
