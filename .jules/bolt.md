# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2025-05-14 - Redundant Analytics Queries
**Learning:** The `getOrderAnalytics` method was performing six separate database queries to calculate basic dashboard metrics. By using TypeORM's `groupBy` and multiple aggregate functions (`COUNT`, `SUM`), these can be consolidated into just two roundtrips (one for status-based metrics and one for time-series data), with final calculations performed in-memory.
**Action:** Always look for opportunities to group aggregate queries by common dimensions (like status or category) to reduce database load and network latency.
