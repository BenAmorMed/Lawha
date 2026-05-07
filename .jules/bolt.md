# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-07 - Database Indexing for Core Entities
**Learning:** Several high-traffic entities (`Product`, `Order`, `ProductSize`, `FrameOption`) lacked indexes on columns used for filtering (`category`, `status`), sorting (`currentPrice`, `createdAt`), and joining (`productId`). While TypeORM handles foreign key relationships, explicit `@Index()` decorators ensure that the underlying database (PostgreSQL) creates the necessary b-tree structures for efficient lookups, avoiding O(N) sequential scans.
**Action:** Always verify that columns used in `.where()`, `.orderBy()`, and join conditions have appropriate database-level indexes to maintain performance as data scales.
