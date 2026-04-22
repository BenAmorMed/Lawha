# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-15 - Optimizing Order Creation Roundtrips
**Learning:** The `OrdersService.createOrder` method was making 3 sequential database calls to fetch `ProductSize`, `Product`, and `FrameOption`. By using TypeORM relations to fetch the `Product` along with the `ProductSize` and using `Promise.all` to parallelize the `FrameOption` lookup, the sequential database roundtrips were reduced from 3 to 1. This significantly improves the performance of the checkout process, which is a critical path for user conversion.
**Action:** Always look for opportunities to use TypeORM relations for related entity lookups and `Promise.all` for independent parallel queries in high-traffic service methods.
