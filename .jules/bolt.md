# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-20 - Redundant Database Roundtrips in Analytics
**Learning:** The `AdminService.getOrderAnalytics` was performing 6 separate database queries (total count, status breakdown, revenue, average value, recent count, and daily breakdown). By using `GROUP BY` on status and date, and performing simple arithmetic in-memory, these were consolidated into just 2 queries. This significantly reduces latency and database connection overhead.
**Action:** Always look for opportunities to consolidate multiple count/sum queries that share the same filtering logic into a single `GROUP BY` query.
