# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-14 - Consolidated Admin Analytics Queries
**Learning:** The `getOrderAnalytics` method was making 6 separate database calls for metrics (total count, status breakdown, revenue, average value, recent count, and daily breakdown). By using a single `GROUP BY status` query, we can derive total count, status breakdown, revenue (by filtering status in-memory), and overall average (Sum of sums / Total count) in one go. Similarly, the 7-day total can be derived from the daily breakdown query results.
**Action:** Always check if multiple aggregate queries on the same table can be consolidated into a single grouped query with in-memory derivation.
