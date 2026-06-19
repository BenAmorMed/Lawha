# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-19 - Preserving Logic during Query Optimization
**Learning:** When consolidating multiple database queries into a single aggregate query (e.g., using `SUM(CASE WHEN ...)`), it's critical to ensure that all business logic filters (like status-based revenue calculation) are preserved. A previous attempt accidentally removed a `status` filter when combining revenue and average order value queries.
**Action:** Always double-check conditional aggregation filters against the original filtered queries.

## 2026-06-19 - Efficient Relation Counting in TypeORM
**Learning:** Using `loadRelationCountAndMap` is significantly more efficient than `leftJoinAndSelect` when only the count of related entities (e.g., `order.items`) is needed for a list view. This avoids hydrating hundreds of objects into memory just to call `.length`.
**Action:** Use `loadRelationCountAndMap` for virtual "count" properties in list API endpoints.
