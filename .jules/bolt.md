# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-07-03 - Optimized Pagination and Order Retrieval
**Learning:** `AdminService.getAllOrders` was using separate `getCount()` and `getMany()` calls, resulting in two database roundtrips. TypeORM's `getManyAndCount()` executes these efficiently in a single operation (though often still two queries under the hood, it's cleaner and better handled by the ORM).
**Action:** Refactored `getAllOrders` to use `getManyAndCount()` for better performance and code maintainability.
