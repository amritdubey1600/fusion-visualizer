export class KShortestPathGraph {
    constructor() {
        this.adj = new Map();
    }

    normalize(str) {
        return str?.trim().toLowerCase();
    }

    addEdge(fromTable, fromColumn, toTable, toColumn, weight = 1) {
        fromTable  = this.normalize(fromTable);
        toTable    = this.normalize(toTable);
        fromColumn = this.normalize(fromColumn);
        toColumn   = this.normalize(toColumn);

        if (fromTable === toTable) return;

        if (!this.adj.has(fromTable)) this.adj.set(fromTable, []);
        if (!this.adj.has(toTable))   this.adj.set(toTable,   []);

        // Canonical key: always sort the two table names so A→B and B→A
        // produce the same key, preventing bidirectional duplicates
        const [canonA, canonB] = fromTable < toTable
            ? [`${fromTable}.${fromColumn}`, `${toTable}.${toColumn}`]
            : [`${toTable}.${toColumn}`,     `${fromTable}.${fromColumn}`];
        const edgeKey = `${canonA}|${canonB}`;

        if (!this._edgeKeys) this._edgeKeys = new Set();
        if (this._edgeKeys.has(edgeKey)) return;   // already registered
        this._edgeKeys.add(edgeKey);

        const fwd = { fromTable, fromColumn, toTable, toColumn, weight };
        const bwd = { 
            fromTable: toTable, fromColumn: toColumn,
            toTable: fromTable, toColumn: fromColumn, weight 
        };

        this.adj.get(fromTable).push(fwd);
        this.adj.get(toTable).push(bwd);
    }

    static fromJSON(joins) {
        const graph = new KShortestPathGraph();
        for (const join of joins) {
            graph.addEdge(
                join.fromTable, join.fromColumn,
                join.toTable,  join.toColumn, join.weight
            );
        }
        return graph;
    }

    findKShortestPaths(start, end, k = 5) {
        start = this.normalize(start);
        end   = this.normalize(end);

        if (!this.adj.has(start) || !this.adj.has(end)) return [];

        // Binary min-heap (by cost)
        const heap   = [];
        const popCnt = new Map();
        const results = [];

        const push = (node) => {
            heap.push(node);
            let i = heap.length - 1;
            while (i > 0) {
                const parent = (i - 1) >> 1;
                if (heap[parent].cost <= heap[i].cost) break;
                [heap[parent], heap[i]] = [heap[i], heap[parent]];
                i = parent;
            }
        };

        const pop = () => {
            const top  = heap[0];
            const last = heap.pop();
            if (heap.length > 0) {
                heap[0] = last;
                let i = 0;
                while (true) {
                    let smallest = i;
                    const l = 2 * i + 1, r = 2 * i + 2;
                    if (l < heap.length && heap[l].cost < heap[smallest].cost) smallest = l;
                    if (r < heap.length && heap[r].cost < heap[smallest].cost) smallest = r;
                    if (smallest === i) break;
                    [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
                    i = smallest;
                }
            }
            return top;
        };

        push({ cost: 0, table: start, path: [], visitSet: new Set([start]) });

        const seenPaths = new Set();
        while (heap.length > 0 && results.length < k) {
            const { cost, table, path, visitSet } = pop();

            const count = (popCnt.get(table) ?? 0) + 1;
            popCnt.set(table, count);

            if (count > k) continue;

            if (table === end) {
                const pathKey = path
                    .map(e => `${e.fromTable}.${e.fromColumn}->${e.toTable}.${e.toColumn}`)
                    .join('|');
            
                if (!seenPaths.has(pathKey)) {
                    seenPaths.add(pathKey);
                    results.push({ cost, edges: path });
                }
                
                continue;
            }

            for (const edge of (this.adj.get(table) ?? [])) {
                // Skip already-visited nodes in this path (no simple-cycle explosion)
                if (visitSet.has(edge.toTable)) continue;

                const newVisit = new Set(visitSet);
                newVisit.add(edge.toTable);

                push({
                    cost:     cost + edge.weight,
                    table:    edge.toTable,
                    path:     [...path, edge],
                    visitSet: newVisit,
                });
            }
        }

        return results;
    }
}

// (() => {
//     KShortestPathGraph.fromWeightedJoinsFile()
//         .findKShortestPaths("doo_headers_all", "oss_products")
//         .forEach((result, idx) => {
//             console.log(`Path ${idx + 1} (cost: ${result.cost}):`);
//             result.edges.forEach(edge => {
//                 console.log(
//                     `  ${edge.fromTable}.${edge.fromColumn} -> ${edge.toTable}.${edge.toColumn} (weight: ${edge.weight})`
//                 );
//             });
//         });
// })();