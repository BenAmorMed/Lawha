# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-04-23 - Optimizing Admin Analytics Queries
**Learning:** Consolidating multiple aggregate queries into grouped queries using `getRawMany()` significantly reduces database roundtrips. Specifically, `AdminService.getOrderAnalytics` was reduced from 6 queries to 2. Calculating summary metrics like total counts and averages in-memory from these grouped results is more efficient than separate database calls. Also, adding a database index to columns used for filtering/grouping (like `createdAt`) is crucial for maintaining performance as data grows.
**Action:** Always look for opportunities to group aggregate queries and ensure indexing on time-series or high-cardinality columns used in reports.
