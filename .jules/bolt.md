# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-29 - Missing Indexes on Relational Entities
**Learning:** Several core entities (`Order`, `OrderItem`, `Product`) were missing indexes on frequently queried foreign keys (`userId`, `orderId`, `productId`) and filtering columns (`status`, `category`). This lead to $O(N)$ table scans for common operations like fetching user order history or filtering the product catalog.
**Action:** Always verify that foreign keys and primary filter columns have `@Index()` decorators in TypeORM entities to ensure $O(\log N)$ lookup performance.
