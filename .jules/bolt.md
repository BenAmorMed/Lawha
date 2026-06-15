# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-15 - Efficient Relation Counting in AdminService
**Learning:** Using `leftJoinAndSelect` on large relations just to get a count (e.g., `order.items.length`) causes significant memory overhead and data transfer as all columns of all related entities are fetched and hydrated. TypeORM's `loadRelationCountAndMap` is much more efficient for this purpose.
**Action:** Use `loadRelationCountAndMap` combined with a virtual entity property for relation counts, and `getManyAndCount()` to consolidate pagination queries.
