# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-04-18 - Admin Analytics and List Query Optimization
**Learning:** The `AdminService.getOrderAnalytics` was performing 6 individual database queries for metrics that could be consolidated. By using a single `GROUP BY` query for all status-related counts and sums, and another for daily distribution, I reduced database roundtrips by 66%. Summary metrics like average order value and total revenue are more efficiently calculated in-memory from the grouped results. Additionally, list views were making separate calls for data and counts, which TypeORM's `getManyAndCount()` optimizes into a single roundtrip.
**Action:** Use `getManyAndCount()` for paginated lists and prefer in-memory aggregation of grouped database results for complex analytics dashboards.
