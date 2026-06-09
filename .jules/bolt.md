# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-09 - Database Indexing for Product Filtering
**Learning:** The `products` table was missing indexes on `category` and `is_active`, which are frequently used for filtering in `ProductsService.getAllProducts`. Adding these indexes optimizes these common query paths from O(n) to O(log n).
**Action:** Always check frequently filtered or sorted columns in TypeORM entities for missing `@Index()` decorators.
