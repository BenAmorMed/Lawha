# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-04-04 - Unindexed Product Filtering and Redundant UI Renders
**Learning:** The `products` table lacked indexes on `category`, `current_price`, `is_active`, and `created_at`, causing full table scans for common shop filters and sorts. In the frontend, the `ProductCard` and `Rating` components were re-rendering unnecessarily during UI interactions (like toggling mobile filters) because they were not memoized.
**Action:** Add targeted database indexes to `Product` entity and apply `React.memo` to high-frequency UI components in the product grid.
