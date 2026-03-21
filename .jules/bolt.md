# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-14 - Redundant Aggregate Queries in Admin Analytics
**Learning:** The `AdminService.getOrderAnalytics` method was performing 6 separate database queries (count, status-grouped, revenue, average, recent, and date-grouped) to build a summary dashboard. Most of these metrics (total count, revenue, average) can be derived in-memory from a single status-grouped query that selects `COUNT` and `SUM`. Similarly, `orders_last_7_days` can be derived by summing the results of a 7-day date-grouped query.
**Action:** Consolidate multiple aggregate queries into status-grouped or date-grouped result sets and derive dependent metrics in-memory to minimize database roundtrips.
