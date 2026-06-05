# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-05 - Query Consolidation and Efficient Counting
**Learning:** Found several performance bottlenecks in `AdminService`. `getOrderAnalytics` was making 6 separate queries (count, status-breakdown, revenue, average, recent-count, daily-stats) which could be consolidated into 2 queries by using `GROUP BY` and in-memory aggregation. `getAllOrders` was over-fetching the entire `items` relation just to get a count, causing significant overhead.
**Action:** Use TypeORM's `loadRelationCountAndMap` for efficient relation counting and consolidate related stats queries using `GROUP BY` to reduce database roundtrips.
