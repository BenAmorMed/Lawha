# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-22 - Optimizing Admin Dashboard Metrics
**Learning:** The `AdminService` was performing 6 separate database roundtrips for dashboard analytics. Consolidating these into 2 grouped queries (using `GROUP BY` on status and date) significantly reduces database load and network latency. Additionally, `getAllOrders` was using `leftJoinAndSelect` for the `items` relation just to get a count, which loaded large `designJson` blobs unnecessarily.
**Action:** Use `loadRelationCountAndMap` for virtual count properties and consolidate aggregate queries into single grouped queries where possible.
