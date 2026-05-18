# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-18 - Admin Dashboard and Order List Query Optimization
**Learning:** The Admin dashboard analytics were performing 6 separate database queries (total count, status breakdown, revenue, average value, recent count, and daily stats) that could be consolidated into 2 grouped queries using SQL aggregations. Furthermore, the order list view was performing a full `leftJoinAndSelect` on the `items` relation, which included large `designJson` blobs, significantly increasing memory usage and database I/O for a view that only required the item count.
**Action:** Use `loadRelationCountAndMap` for summary list views where only the count of a relation is needed. Consolidate multiple aggregate queries on the same table into single queries using `groupBy` and multiple `addSelect` aggregate functions. Use `getManyAndCount` to reduce roundtrips for paginated results.
