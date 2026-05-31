# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-21 - Optimization of AdminService and Large Blob Avoidance
**Learning:** The `AdminService` was loading full `OrderItem` entities in `getAllOrders`, which include a `designJson` field that can be very large. This caused significant memory and network overhead. Additionally, `getOrderAnalytics` was performing redundant `COUNT` queries that could be derived from existing grouped results.
**Action:** Use `loadRelationCountAndMap` to fetch relation counts without loading full entities in list views, and derive totals from grouped query results in memory to reduce database roundtrips.
