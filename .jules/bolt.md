# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-04-17 - Redundant Analytics and Pagination Queries in Admin Module
**Learning:** The `AdminService.getOrderAnalytics` was performing 6 individual queries (count, status breakdown, revenue, AOV, recent count, and daily distribution) where many could be derived from grouped results. Consolidating into 2 queries (status-grouped and date-grouped) reduces database roundtrips by 66%. Additionally, separate `getCount` and `getMany` calls in pagination can be optimized into a single `getManyAndCount` call.
**Action:** Always look for opportunities to consolidate multiple aggregate queries into a single "group by" query and use `getManyAndCount` for paginated listings.
