export class Graph {
    constructor() {
        this.adj = new Map();
    }

    normalize(str) {
        return str?.trim().toLowerCase();
    }

    addEdge(fromTable, fromColumn, toTable, toColumn) {
        fromTable = this.normalize(fromTable);
        toTable = this.normalize(toTable);
        fromColumn = this.normalize(fromColumn);
        toColumn = this.normalize(toColumn);

        if (!this.adj.has(fromTable)) {
            this.adj.set(fromTable, []);
        }

        const exists = this.adj.get(fromTable).some(e =>
            e.toTable === toTable && e.fromColumn === fromColumn
        );

        if (!exists) {
            this.adj.get(fromTable).push({
                fromTable,
                fromColumn,
                toTable,
                toColumn
            });
        }

        if (!this.adj.has(toTable)) {
            this.adj.set(toTable, []);
        }

        const reverseExists = this.adj.get(toTable).some(e =>
            e.toTable === fromTable && e.fromColumn === toColumn
        );

        if (!reverseExists) {
            this.adj.get(toTable).push({
                fromTable: toTable,
                fromColumn: toColumn,
                toTable: fromTable,
                toColumn: fromColumn
            });
        }
    }

    // Convert Map → Object for JSON
    toJSON() {
        return Object.fromEntries(this.adj);
    }

    // Load from JSON
    static fromJSON(json) {
        const graph = new Graph();
        graph.adj = new Map(Object.entries(json));
        return graph;
    }

    // BFS to find path
    findPath(start, end) {
        start = this.normalize(start);
        end = this.normalize(end);

        if (!this.adj.has(start) || !this.adj.has(end)) {
            return null;
        }

        const queue = [{
            table: start,
            path: [] // will store edges
        }];

        const visited = new Set();

        while (queue.length > 0) {
            const { table, path } = queue.shift();

            if (table === end) {
                return path;
            }

            if (visited.has(table)) continue;
            visited.add(table);

            for (const edge of this.adj.get(table)) {
                if (!visited.has(edge.toTable)) {
                    queue.push({
                        table: edge.toTable,
                        path: path.concat(edge)
                    });
                }
            }
        }

        return null;
    }
}
