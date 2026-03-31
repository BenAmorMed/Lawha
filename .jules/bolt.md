# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-15 - Missing Database Indexes on Core Entities
**Learning:** High-frequency query paths in the `Product` catalog (filtering by category, price, and sorting by rating/popularity) and join paths (Product -> Sizes/Frames, User -> Orders) were unindexed. This leads to full table scans as the dataset grows. Specifically, columns like `currentPrice`, `category`, `isActive`, `createdAt`, `isSpecial`, `rating`, and `reviewsCount` in the `Product` entity, and foreign keys like `productId`, `orderId`, and `userId` across related entities required indexing.
**Action:** Systematically identify and apply `@Index()` decorators to all columns involved in `WHERE`, `ORDER BY`, and `JOIN` clauses across core entities.
