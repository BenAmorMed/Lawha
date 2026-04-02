# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-22 - Memoization for List Items
**Learning:** In the `ProductGrid`, re-renders are frequent due to filter state changes (category, price range). Missing memoization on `ProductCard` and its sub-component `Rating` causes redundant processing for all items in the grid on every filter toggle, even if the product list remains unchanged.
**Action:** Prioritize `React.memo` for components rendered within lists or grids that are subject to frequent parent state updates.
