# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-26 - Admin Dashboard Query Optimization
**Learning:** The admin panel was fetching full `OrderItem` entities (including large `designJson` blobs) just to count items in the order list view. Additionally, separate `getCount()` and `getMany()` calls were causing redundant database interactions. Whitelisting `sortBy` parameters not only improves security but also ensures only indexed columns are used for sorting in performance-critical paths.
**Action:** Use `loadRelationCountAndMap` to fetch relation counts efficiently and `getManyAndCount` to consolidate pagination queries. Always whitelist user-provided sort parameters.
