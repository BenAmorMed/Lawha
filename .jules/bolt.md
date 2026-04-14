# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-04-14 - Product Rating Denormalization
**Learning:** For frequently accessed aggregate data like average product ratings and review counts, denormalizing these values into the `Product` entity significantly improves performance. It reduces database load by replacing heavy aggregate queries (`AVG`, `COUNT`) with simple column lookups during product listing and review fetching. Ensuring data consistency requires updating these denormalized fields on every review creation, update, or deletion.
**Action:** Use denormalization for high-read, low-write aggregate statistics to optimize dashboard and gallery performance.
