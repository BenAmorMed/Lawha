# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-05-17 - Large Data Blobs in List Views
**Learning:** Joining relations like `order_items` in an order list view can be extremely expensive if those relations contain large `JSONB` fields (e.g., `designJson`). Even if the frontend only needs the item count, a standard `leftJoinAndSelect` pulls all fields into memory and onto the wire.
**Action:** Use TypeORM's `loadRelationCountAndMap` to fetch only the count of related entities without loading the entities themselves, drastically reducing database payload and memory footprint for list operations.
