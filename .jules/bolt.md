# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-27 - Admin Query Optimization and Indexing
**Learning:** Found that the Admin dashboard was loading full OrderItem entities (including potentially large designJson blobs) just to show the count of items in the order list. Replaced this with TypeORM's `loadRelationCountAndMap` which performs a subquery for the count instead of fetching all records. Also consolidated separate `getCount()` and `getMany()` calls into `getManyAndCount()` to reduce database roundtrips.
**Action:** Use `loadRelationCountAndMap` for relation counts in list views and prefer `getManyAndCount()` for paginated results. Always ensure foreign keys and frequently filtered columns like `status` or `category` are indexed.
