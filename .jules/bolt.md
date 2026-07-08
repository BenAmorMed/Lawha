# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-07-08 - Analytics Query Consolidation
**Learning:** The `AdminService.getOrderAnalytics` method was performing 6 sequential queries for independent statistics. By using `Promise.all` and grouping by status, I was able to consolidate these into 2 parallelized queries. In-memory processing of the grouped results allowed calculating global totals, revenue, and averages without additional database roundtrips.
**Action:** Always look for opportunities to consolidate independent aggregate queries by using grouping or conditional aggregation in a single query.
