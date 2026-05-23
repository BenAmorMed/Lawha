# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-23 - Consolidating Admin Analytics and Order Listing
**Learning:** The Admin Dashboard was suffering from N+1-like behavior and redundant database roundtrips. Specifically, `getAllOrders` was loading full `OrderItem` entities (including large `designJson` blobs) just to count them, and `getOrderAnalytics` was performing 6 separate aggregate queries.
**Action:** Use `loadRelationCountAndMap` for efficient child entity counting and consolidate multiple aggregate queries into a single `groupBy('order.status')` query to minimize database load.
