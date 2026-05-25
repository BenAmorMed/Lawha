# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-25 - Data Transfer Bottleneck in Order Lists
**Learning:** Fetching full relations (like `OrderItems`) just to get a count can be extremely expensive if those entities contain large blobs (like `designJson`). TypeORM's `loadRelationCountAndMap` allows fetching just the count via a subquery, significantly reducing database I/O and application memory usage. Consolidating `getCount()` and `getMany()` into `getManyAndCount()` also streamlines query execution.
**Action:** Use `loadRelationCountAndMap` for relation counts in list views to avoid loading heavy entities unnecessarily.
