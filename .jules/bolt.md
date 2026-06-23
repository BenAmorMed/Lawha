# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-23 - Query Consolidation and Indexing in Admin Module
**Learning:** The administrative dashboard was suffering from high latency due to multiple sequential database roundtrips and full relation hydration. Consolidating 6 analytics queries into 3 parallel operations using conditional SQL aggregation (`SUM(CASE WHEN...)`) significantly reduced DB load. Additionally, using `loadRelationCountAndMap` instead of full `leftJoinAndSelect` for item counts prevented unnecessary data hydration.
**Action:** Always prefer conditional aggregation for multi-stat queries and use TypeORM's specialized count mapping for related entities when full data isn't needed.
