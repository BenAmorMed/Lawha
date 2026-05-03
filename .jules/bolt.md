# Bolt's Journal - Critical Learnings

## 2025-05-14 - Initial Setup
**Learning:** Starting the performance optimization journey for this repository.
**Action:** Always document significant findings here.

## 2025-05-14 - Redundant Queries in Reviews Module
**Learning:** The `ReviewsService` was performing multiple database roundtrips for operations that could be optimized into a single query or by reusing existing results. Specifically, `getProductStats` was making 3 queries (distribution, count, average) when the count and average could be calculated in-memory from the distribution. `getProductReviews` was also performing a redundant `COUNT` query despite TypeORM's `getManyAndCount` already providing the total. Additionally, the `reviews` table lacked indexes on `productId` and `userId`.
**Action:** Consolidate redundant queries and add missing database indexes on high-frequency query paths.

## 2026-03-05 - Optimized Query Performance via Strategic Indexing
**Learning:** Identifying high-traffic query paths (filtering by category, looking up user order history, sorting by creation date) and adding database indexes significantly improves query execution time as the dataset grows. In TypeORM, adding `@Index()` to entity columns is a simple yet effective way to achieve this.
**Action:** Always check for missing indexes on foreign keys and frequently filtered/sorted columns during performance audits.
