import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function chooseBestPath(
    fromTable: string,
    toTable: string,
    formattedPaths: string
) {

    const prompt = `
        You are an Oracle Fusion data model expert.

        Given candidate join paths between source and destination tables, rank them by business correctness and choose the single best path.
        
        [IMPORTANT GUIDELINES]
        - Even if a path is shorter, prefer a longer path if it follows meaningful business relationships.
        - Respect natural document hierarchies (e.g., Headers -> Lines -> Schedules/Fulfillments/Distributions). Do NOT skip intermediate logical tables like "Lines".
        - Use primary-key/foreign-key style joins.
        - Avoid lookup tables unless necessary.
        - Avoid audit/history tables unless necessary.
        - Avoid many-to-many bridge tables unless required.
        - Read ALL paths before choosing; the best path may not be the first one.

        --- EXAMPLES ---

        Example 1 (Order Management Hierarchy):
        Source Table: DOO_HEADERS_ALL
        Destination Table: DOO_FULFILL_LINES_ALL
        Candidate Paths:
        Path 1: DOO_HEADERS_ALL -> DOO_FULFILL_LINES_ALL
        Path 2: DOO_HEADERS_ALL -> DOO_LINES_ALL -> DOO_FULFILL_LINES_ALL
        Path 3: DOO_HEADERS_ALL -> WSH_NEW_DELIVERIES -> DOO_FULFILL_LINES_ALL
        Reasoning: Path 1 inappropriately skips the natural "Lines" hierarchy. Path 2 follows the correct business flow (Headers -> Lines -> Fulfillment).
        Output:
        { "pathNumber": 2 }

        Example 2 (Procurement Hierarchy):
        Source Table: PO_HEADERS_ALL
        Destination Table: PO_DISTRIBUTIONS_ALL
        Candidate Paths:
        Path 1: PO_HEADERS_ALL -> PO_LINES_ALL -> PO_DISTRIBUTIONS_ALL
        Path 2: PO_HEADERS_ALL -> PO_DISTRIBUTIONS_ALL
        Path 3: PO_HEADERS_ALL -> PO_LINES_ALL -> PO_LINE_LOCATIONS_ALL -> PO_DISTRIBUTIONS_ALL
        Reasoning: Path 3 respects the complete Purchasing document hierarchy (Headers -> Lines -> Schedules/Locations -> Distributions).
        Output:
        { "pathNumber": 3 }

        --- END EXAMPLES ---

        Now, process the following real request:

        Source Table:
        ${fromTable}

        Destination Table:
        ${toTable}

        Candidate Paths:

        ${formattedPaths}

        Return ONLY valid JSON in the exact format:
        {
          "pathNumber": number
        }
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.1, // Keeping this low is perfect for analytical consistency
        },
    });

    const text = response.text?.trim();

    if (!text) {
        throw new Error("Empty Gemini response");
    }

    return JSON.parse(text);
}
