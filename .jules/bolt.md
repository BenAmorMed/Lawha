# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-15 - Redundant Roundtrips in Analytics and Pagination
**Learning:** The `AdminService` was suffering from multiple redundant database roundtrips. Specifically, `getOrderAnalytics` was making 6 separate queries for data that could be fetched in 2 grouped queries (one for status-based metrics and one for date-based metrics). Additionally, standard pagination patterns using separate `getCount()` and `getMany()` were doubling the query load for simple list fetches.
**Action:** Always prefer `getManyAndCount()` for paginated TypeORM queries and use SQL grouping/aggregation to consolidate metrics queries, performing final calculations in-memory.
