# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-28 - Administrative Query Bloat and Roundtrips
**Learning:** `AdminService.getAllOrders` was loading entire `OrderItem` entities (including large JSON blobs) just to count them, significantly increasing memory usage and latency. Additionally, `getOrderAnalytics` was performing 6 sequential queries.
**Action:** Use `loadRelationCountAndMap` for efficient counting without entity hydration. Consolidate analytics queries into parallel branches with conditional SQL aggregation. Add database indexes to `userId`, `status`, and `createdAt` in the `orders` table.
