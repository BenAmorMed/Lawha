# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-13 - Optimizing Admin Order Listing
**Learning:** Admin listing pages often fetch related entities just to show a count (e.g., number of items in an order). Using `leftJoinAndSelect` hydrates full entities, which is memory-intensive and slow. TypeORM's `loadRelationCountAndMap` allows fetching just the count into a virtual property. Additionally, consolidating `getCount` and `getMany` into `getManyAndCount` reduces the cognitive load of the service logic and is more idiomatic.
**Action:** Use `loadRelationCountAndMap` for counts of relations and `getManyAndCount` for paginated results. Always add `@Index()` to fields used in `WHERE` and `ORDER BY` clauses for large tables like `orders`.
