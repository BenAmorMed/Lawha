# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-14 - Aggregating Analytics in AdminService
**Learning:** `AdminService.getOrderAnalytics` was performing 6 separate database queries for total orders, status breakdown, revenue, average value, recent orders count, and daily distribution. These can be consolidated into 2 queries: one for status-based metrics (count/sum) and one for daily distribution. Revenue, total count, and average value can be derived in-memory from the status-based aggregation.
**Action:** Use SQL `GROUP BY` and aggregations to fetch multiple metrics in a single roundtrip, then perform remaining calculations in-memory.
