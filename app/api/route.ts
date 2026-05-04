import { NextRequest, NextResponse } from "next/server";
import { Graph } from "@/lib/graph";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const fromTable = searchParams.get("fromTable");
    const toTable = searchParams.get("toTable");

    if (!fromTable || !toTable) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    try {
        const filePath = path.join(process.cwd(), 'graph.json');
        const fileContents = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContents);

        const graph = Graph.fromJSON(data);
        const routePath = graph.findPath(fromTable, toTable);

        if (!routePath) {
            return NextResponse.json({ message: "No path found", path: null }, { status: 404 });
        }

        return NextResponse.json({ message: "Path found", path: routePath }, { status: 200 });

    } catch (error) {
        console.error("Error reading graph file:", error);
        return NextResponse.json({ error: "Failed to load graph data" }, { status: 500 });
    }
}