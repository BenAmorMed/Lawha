# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-04-16 - Admin Analytics Query Consolidation
**Learning:** The Admin Analytics dashboard was performing 6 separate database queries to gather basic statistics (total count, status breakdown, revenue, average order value, recent orders, and daily distribution). All status-related metrics can be fetched in a single grouped query, and recent order metrics can be derived from the daily distribution query. Additionally, using TypeORM's `getManyAndCount()` is more efficient than manual `getCount()` and `getMany()` calls for paginated lists.
**Action:** Consolidate redundant database roundtrips into grouped queries and use `getManyAndCount()` for pagination.
