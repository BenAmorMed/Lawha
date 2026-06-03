# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-03 - Optimizing Admin Queries with TypeORM
**Learning:** Using `leftJoinAndSelect` solely to get a count (e.g., `order.items.length`) is highly inefficient as it hydrates all related entities. TypeORM's `loadRelationCountAndMap` is a much faster alternative that uses a subquery. Additionally, multiple aggregation queries (like SUM and AVG) in a dashboard can be consolidated into a single `.select().addSelect()` call with conditional aggregation to minimize database roundtrips.
**Action:** Use `loadRelationCountAndMap` for relationship counts and consolidate dashboard aggregation queries.
