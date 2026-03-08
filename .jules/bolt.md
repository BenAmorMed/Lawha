## 2026-03-08 - [Review Statistics Consolidation]
**Learning:** In TypeORM/PostgreSQL environments, retrieving aggregate statistics (AVG, COUNT, GROUP BY) for the same entity and filter separately is inefficient. A single `GROUP BY` query for the distribution of values (e.g., ratings 1-5) can provide all necessary data to calculate weighted averages and total counts in-memory.
**Action:** When implementing summary dashboards or stats endpoints, always check if multiple aggregate queries can be replaced by a single distribution query followed by in-memory calculation.
