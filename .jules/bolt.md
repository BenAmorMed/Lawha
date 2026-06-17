# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-17 - Expensive Analytics Aggregation
**Learning:** The `AdminService.getOrderAnalytics` was performing six separate database queries for total orders, status breakdown, revenue, average order value, and recent orders. This created unnecessary I/O overhead and latency. By using a single grouped query for status-based metrics and deriving global stats (revenue, total count, average) in-memory, and by reusing the 7-day daily breakdown for the "recent orders" count, the number of database roundtrips was reduced by 66%.
**Action:** Always look for opportunities to consolidate aggregate queries using `GROUP BY` and perform final calculations (sums, averages, counts) in the application layer when possible.
