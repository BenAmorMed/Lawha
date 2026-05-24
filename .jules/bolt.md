# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-24 - Optimized Admin Order Listing
**Learning:** `AdminService.getAllOrders` was performing redundant database queries and loading unnecessary large blobs (`designJson`) for list views. Using `getManyAndCount` reduces roundtrips, and `loadRelationCountAndMap` allows retrieving relation counts without fetching full entities.
**Action:** Always prefer `getManyAndCount` for paginated results and use `loadRelationCountAndMap` for summary statistics in list views to avoid over-fetching.
