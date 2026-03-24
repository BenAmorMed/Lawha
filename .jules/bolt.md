# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-03-24 - Redundant Database Roundtrips in Admin Analytics
**Learning:** The `AdminService.getOrderAnalytics` method was performing 6 separate database queries (total count, status breakdown, revenue, average order value, 7-day count, and daily stats). These can be consolidated into 2 queries (all-time stats grouped by status, and 7-day stats grouped by date) by calculating the final metrics in-memory. This significantly reduces network latency and database overhead.
**Action:** Always look for opportunities to consolidate multiple aggregate queries on the same table by using `GROUP BY` and performing final calculations in-memory.
