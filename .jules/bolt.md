# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-19 - Consolidated Analytics Queries
**Learning:** Consolidation of multiple independent aggregate queries (COUNT, SUM, AVG) into a single GROUP BY query significantly reduces database roundtrips (from 6 to 2 in this case) and allows for more efficient in-memory aggregation of metrics.
**Action:** Identify patterns where multiple single-value aggregate queries are executed on the same table and replace them with consolidated grouping queries.
