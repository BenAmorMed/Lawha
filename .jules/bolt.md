# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-06-22 - Optimizing Admin Analytics and Listings
**Learning:** Found that `AdminService.getOrderAnalytics` was performing six separate queries. Consolidating global/status-based metrics into a single query using conditional SQL aggregation (`SUM(CASE WHEN ...)`) reduced roundtrips by 66%. Additionally, `getAllOrders` was fetching full `items` relations just to get a count; using `loadRelationCountAndMap` with a virtual property avoided this overhead.
**Action:** Use conditional aggregation for mixed-status summary queries and `loadRelationCountAndMap` for related entity counts in listing views.
