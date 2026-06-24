# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-24 - Admin Analytics Query Consolidation
**Learning:** The `AdminService.getOrderAnalytics` was making six sequential queries, causing significant dashboard latency. By using conditional aggregation (`SUM(CASE WHEN...)`), summary statistics (total, revenue, avg, recent) were consolidated into a single database roundtrip. Combining this with `Promise.all` for parallel execution of breakdown queries reduced the total roundtrips to three. Also, using `loadRelationCountAndMap` in `getAllOrders` avoided expensive full-entity joins for simple counts.
**Action:** Use conditional SQL aggregation to consolidate metrics and `Promise.all` for independent queries; prefer `loadRelationCountAndMap` for count-only relations.
