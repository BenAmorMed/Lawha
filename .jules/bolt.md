# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-07-05 - Query Consolidation and Parallelization in Orders/Admin Services
**Learning:** Identified a 'sequential query waterfall' anti-pattern in `OrdersService.createOrder` and redundant database roundtrips in `AdminService`. Using `Promise.all` for concurrent independent lookups and SQL conditional aggregation (`CASE WHEN`) for multi-metric analytics reduces latency and database load significantly compared to multiple sequential `await` calls.
**Action:** Use `loadRelationCountAndMap` to fetch relation counts without loading full entities, and consolidate disparate statistics into single aggregated queries using `getRawOne()` with multiple selects.
