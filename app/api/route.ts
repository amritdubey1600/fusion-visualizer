import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { KShortestPathGraph } from "@/lib/weightedGraph";
import { chooseBestPath } from "@/utils/gemini";
import { formatPathsForLLM } from "@/utils/pathFromatter";

// import { Graph } from "@/lib/graph";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const fromTable = searchParams.get("fromTable");
    const toTable = searchParams.get("toTable");

    if (!fromTable || !toTable) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    try {
        // const filePath = path.join(process.cwd(), 'graph.json');
        // const fileContents = fs.readFileSync(filePath, 'utf-8');
        // const data = JSON.parse(fileContents);

        // const graph = Graph.fromJSON(data);
        // const routePath = graph.findPath(fromTable, toTable);

        // if (!routePath) {
        //     return NextResponse.json({ message: "No path found", path: null }, { status: 404 });
        // }

        // return NextResponse.json({ message: "Path found", path: routePath }, { status: 200 });

        // console.log(`API hit: Finding paths from ${fromTable} to ${toTable}`);

        const filePath = path.join(
            process.cwd(),
            "weightedJoins.json"
        );

        const fileContents = fs.readFileSync(filePath, "utf-8");

        const joins = JSON.parse(fileContents);

        const kGraph = KShortestPathGraph.fromJSON(joins);
        const kPaths = kGraph.findKShortestPaths(fromTable, toTable, 60);

        if (!kPaths) {
            return NextResponse.json({ message: "No path found", path: null }, { status: 404 });
        }        

        const formattedPaths = formatPathsForLLM(kPaths);
        // console.log(`Found ${kPaths.length} paths from ${fromTable} to ${toTable} as follows:\n${formattedPaths}`);

        const geminiResult = await chooseBestPath(
            fromTable,
            toTable,
            formattedPaths
        );

        // const geminiResult = {"pathNumber": 1};
        // console.log("Gemini result:", geminiResult);

        return NextResponse.json({ message: "Path found", path: [kPaths[geminiResult["pathNumber"]-1]] }, { status: 200 });

    } catch (error) {
        console.error("Error reading graph file:", error);
        return NextResponse.json({ error: "Failed to load graph data" }, { status: 500 });
    }
}