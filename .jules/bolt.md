# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-09 - Consolidated Admin Analytics and Efficient Item Counting
**Learning:** The `AdminService.getOrderAnalytics` was performing 6 separate queries for data that could be aggregated into 2. Furthermore, `getAllOrders` was loading all order items just to get a count, which is extremely inefficient as the database grows.
**Action:** Use `loadRelationCountAndMap` for efficient item counting and consolidate aggregation queries using `GROUP BY` and in-memory derivation. Always use `getManyAndCount` for paginated results to save a database roundtrip.
