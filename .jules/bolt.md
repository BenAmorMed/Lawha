# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-15 - Redundant Aggregate Queries in Admin Dashboard
**Learning:** The administrative dashboard was performing multiple individual aggregate queries (COUNT, SUM, AVG) on the same table, leading to unnecessary database roundtrips. These can be consolidated into a single QueryBuilder call using multiple `.addSelect()` and `.groupBy()` calls. Additionally, TypeORM's `getManyAndCount()` is significantly more efficient than separate `getCount()` and `getMany()` calls for paginated lists.
**Action:** Always consolidate aggregate statistics for the same resource into a single grouped query and use `getManyAndCount()` for paginated data retrieval.
