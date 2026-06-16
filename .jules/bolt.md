# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-16 - Query Consolidation in AdminService
**Learning:** Multiple discrete aggregate queries (count, sum, avg) on the same table can be consolidated into a single query using GROUP BY. TypeORM's `loadRelationCountAndMap` provides a significant performance boost for listing pages by avoiding full relation hydration when only a count is needed.
**Action:** Always look for opportunities to use `getManyAndCount()` and `loadRelationCountAndMap()` in list views, and group aggregate queries in analytics paths.
