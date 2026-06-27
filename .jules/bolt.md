# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-27 - Optimizing Sequential Database Fetches in Orders
**Learning:** Sequential database calls in `OrdersService.createOrder` (ProductSize -> Product -> FrameOption) were causing unnecessary I/O overhead. Using TypeORM's `relations` for JOINs and `Promise.all` for independent parallel fetches reduced the round-trips from 3 to 1 (fetching size and product together) or 2 (if frame option is also fetched).
**Action:** Always check for opportunities to use TypeORM `relations` for joined fetches and parallelize independent entity lookups in service methods to minimize database round-trips.
