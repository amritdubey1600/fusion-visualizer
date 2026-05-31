export function formatPathsForLLM(
    kPaths: {
        cost: number;
        edges: {
            fromTable: string;
            fromColumn: string;
            toTable: string;
            toColumn: string;
        }[];
    }[]
): string {
    return kPaths
        .map((path, idx) => {
            const joins = path.edges
                .map(
                    edge => `
                    ${edge.fromTable}.${edge.fromColumn} -> ${edge.toTable}.${edge.toColumn}`
                )
                .join("\n");

            return `
                Path ${idx + 1}
                ${joins}
            `;
        }).join("\n");
}