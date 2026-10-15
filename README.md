# Fusion Visualizer

**Table Relationship Explorer for Oracle Fusion**

Find the join path between any two tables in Oracle Fusion Applications, and get back the join that actually makes business sense, not just the shortest one.

<p align="center">
  <img src="docs/screenshots/home.png" alt="Fusion Visualizer home screen" width="85%">
</p>

---

## The Problem

Oracle Fusion has thousands of tables, and the relationships between them are scattered across the official documentation. Answering a simple question like *"how do I get from `doo_headers_all` to `doo_fulfill_lines_all`?"* usually means opening a dozen browser tabs, tracing foreign keys by hand, and hoping you picked the right route.

Even when you find a path, the shortest one is not always the right one. Some routes are technically valid but semantically meaningless for the business question you are trying to answer.

## The Solution

Fusion Visualizer automates the whole process:

1. **Builds a schema graph** from the official Oracle Fusion documentation, with tables as nodes and foreign-key relationships as edges.
2. **Finds the K shortest paths** between your source and target table using Dijkstra-based K-shortest-path search.
3. **Passes the K candidates to an AI agent**, which evaluates them against business context and returns the best possible join.
4. **Visualizes the result** as an interactive path with the exact `JOIN` conditions ready to use.

<p align="center">
  <img src="docs/screenshots/join-path-result.png" alt="Join path result showing path, cost, hops and join conditions" width="70%">
</p>

---

## Features

- **Join path discovery** between any two tables in the Oracle Fusion data model
- **K-shortest-paths search** that returns multiple candidate routes instead of a single answer
- **Agent-based ranking** that picks the join that best fits real business meaning
- **Visual path explorer** with source, intermediate and target tables laid out as a graph
- **Edge labels** showing the exact column mapping on every hop (e.g. `header_id → header_id`)
- **Join conditions panel** listing each join step, ready to paste into SQL
- **Path metadata** including total cost and hop count
- **Keyboard friendly**: press Enter to search

---

## How It Works

```
┌────────────────────┐
│  Oracle Fusion     │
│  official docs     │
└─────────┬──────────┘
          │  parse tables, columns, PK/FK relationships
          ▼
┌────────────────────┐
│   Schema Graph     │   nodes = tables
│                    │   edges = foreign-key relationships
└─────────┬──────────┘
          │  source table + target table
          ▼
┌────────────────────┐
│  K-Shortest Paths  │   Dijkstra-based search
│                    │   returns the K lowest-cost paths
└─────────┬──────────┘
          │  K candidate paths
          ▼
┌────────────────────┐
│    Agent Ranker    │   evaluates candidates against
│                    │   business meaning and intent
└─────────┬──────────┘
          │  best path + join conditions
          ▼
┌────────────────────┐
│  Visual Explorer   │
└────────────────────┘
```

### 1. Schema graph construction

Table definitions and their primary/foreign key relationships are extracted from the official Oracle Fusion documentation and modeled as a graph. Each table is a node, and each foreign-key relationship becomes an edge that carries the column mapping used for the join.

### 2. K-shortest-path search

Given a source and target table, the engine runs a Dijkstra-based K-shortest-path search over the graph. Rather than returning only the single cheapest route, it returns the top **K** candidates. This matters because in an ERP schema the cheapest path is frequently not the most meaningful one.

### 3. Agent-based selection

The K candidate paths are handed to an agent that reasons about which one best reflects the relationship a business user or developer actually wants. It can reject paths that route through unrelated tables or use technically valid but semantically wrong keys, and it returns the best join along with the conditions for each hop.

### 4. Visualization

The selected path is rendered as an interactive graph, with a summary of cost and hops and a step-by-step list of join conditions.

---

## Example

**Source:** `doo_headers_all`
**Target:** `doo_fulfill_lines_all`

| | |
|---|---|
| **Result** | Path found |
| **Cost** | 2 |
| **Hops** | 2 |

**Path**

```
doo_headers_all ──(header_id → header_id)──▶ doo_lines_all ──(line_id → line_id)──▶ doo_fulfill_lines_all
```

**Join conditions**

| # | Left table | Join | Right table |
|---|-----------|------|-------------|
| 1 | `doo_headers_all.header_id` | `JOIN` | `doo_lines_all.header_id` |
| 2 | `doo_lines_all.line_id` | `JOIN` | `doo_fulfill_lines_all.line_id` |

**Equivalent SQL**

```sql
SELECT *
FROM   doo_headers_all h
JOIN   doo_lines_all l
       ON h.header_id = l.header_id
JOIN   doo_fulfill_lines_all f
       ON l.line_id = f.line_id;
```

---

## Getting Started

> **Note:** Update the commands below to match your actual stack.

## Usage

1. Enter a **source table**, for example `doo_headers_all`.
2. Enter a **target table**, for example `doo_fulfill_lines_all`.
3. Click **Find Path** or press **Enter**.
4. Review the path graph, cost and hop count.
5. Copy the join conditions from the **Join Conditions** panel into your query.

---
## Design Notes

- **Why K paths instead of one?** In ERP schemas, many tables are connected through shared keys like `header_id` or `org_id`. The lowest-cost path can pass through a table that is technically linked but meaningless for the question at hand. Generating several candidates and letting an agent judge them gives a far more useful answer.
- **Why a graph?** Modeling the schema as a graph turns "how do these tables relate?" into a well-understood problem with efficient, proven algorithms.
- **Source of truth.** The graph is built from the official Oracle documentation, so relationships reflect what Oracle publishes rather than what is inferred from data.

---

## Limitations

- Coverage is limited to relationships documented in the official Oracle Fusion documentation. Custom tables, flexfields and undocumented relationships will not appear.
- The agent's selection is a recommendation. Validate the final join against your data and requirements before using it in production reports.

---

## Roadmap

- [ ] Show all K candidate paths side by side in the UI
- [ ] Show the agent's reasoning for why it picked a path
- [ ] Support multi-table paths (A → B → C)
- [ ] Table and column autocomplete
- [ ] Export join as SQL
- [ ] Support custom edge weights

---

## Contributing

Contributions are welcome. Please open an issue to discuss what you would like to change, then submit a pull request.

---

<p align="center">
  <sub>Fusion Visualizer is an independent project and is not affiliated with or endorsed by Oracle. Oracle and Oracle Fusion are trademarks of Oracle Corporation.</sub>
</p>
