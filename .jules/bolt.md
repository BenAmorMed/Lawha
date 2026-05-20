# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-20 - Redundant Aggregations and Entity Loading in Admin Dashboard
**Learning:** The `AdminService` exhibited two significant performance anti-patterns:
1. `getOrderAnalytics` performed 6 separate database roundtrips for metrics that could be consolidated into 2 queries (one for status-based totals and one for time-based totals), performing the remaining aggregations in-memory.
2. `getAllOrders` eagerly loaded full `OrderItem` entities just to calculate `items.length`. Since `OrderItem` includes large `designJson` blobs, this significantly increased database load and memory usage.
**Action:** Use `loadRelationCountAndMap` to fetch relation counts without loading entities, and consolidate multiple aggregate queries into single grouped queries using TypeORM QueryBuilder.
