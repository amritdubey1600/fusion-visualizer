import { PathStep } from "@/app/page";

function getNodes(path: PathStep[]): string[] {
  if (!path.length) return [];
  const nodes: string[] = [path[0].fromTable];
  for (const step of path) nodes.push(step.toTable);
  return nodes;
}

export function PathGraph({ path }: { path: PathStep[] }) {
  const nodes = getNodes(path);

  const CHAR_W = 7.5;       // px per char at 11.5px IBM Plex Mono
  const DOT_PAD = 26;       // dot + gap before text
  const H_PAD = 32;         // left + right padding inside node
  const NODE_H = 56;
  const NODE_MIN_W = 120;
  const LABEL_H_PAD = 24;   // pill horizontal padding
  const LABEL_MARGIN = 24;  // min clear space between pill edges and node edges
  const PAD = 32;
  const SVG_H = 180;
  const cy = SVG_H / 2;

  // Per-node width based on its own label
  const nodeWidths = nodes.map(name =>
    Math.max(NODE_MIN_W, Math.ceil(name.length * CHAR_W) + DOT_PAD + H_PAD)
  );

  // Per-edge gap based on its own label
  const edgeGaps = path.map(step => {
    const label = `${step.fromColumn} → ${step.toColumn}`;
    const pillW = Math.ceil(label.length * CHAR_W) + LABEL_H_PAD;
    return Math.max(60, pillW + LABEL_MARGIN * 2);
  });

  // x position of each node
  const nx = (i: number): number => {
    let x = PAD;
    for (let j = 0; j < i; j++) x += nodeWidths[j] + edgeGaps[j];
    return x;
  };

  const totalW =
    PAD * 2 +
    nodeWidths.reduce((s, w) => s + w, 0) +
    edgeGaps.reduce((s, g) => s + g, 0);

  // Max chars that fit in a node without wrapping
  const charsForWidth = (w: number) =>
    Math.floor((w - DOT_PAD - H_PAD) / CHAR_W);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${totalW} ${SVG_H}`}
        width={totalW}
        height={SVG_H}
        style={{ minWidth: totalW, display: "block" }}
      >
        <defs>
          <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0.5 L0,5.5 L6.5,3 z" fill="#64748b" />
          </marker>
          <filter id="shadow" x="-20%" y="-40%" width="140%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Edges — each sized to its own label */}
        {path.map((step, i) => {
          const label = `${step.fromColumn} → ${step.toColumn}`;
          const pillW = Math.ceil(label.length * CHAR_W) + LABEL_H_PAD;
          const x1 = nx(i) + nodeWidths[i] + 4;
          const x2 = nx(i + 1) - 4;
          const mx = (x1 + x2) / 2;
          return (
            <g key={i}>
              <line
                x1={x1} y1={cy} x2={x2} y2={cy}
                stroke="#cbd5e1" strokeWidth="1.5"
                markerEnd="url(#arr)"
              />
              <rect
                x={mx - pillW / 2} y={cy - 26}
                width={pillW} height={20}
                rx="10"
                fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"
              />
              <text
                x={mx} y={cy - 12}
                textAnchor="middle"
                fontSize="10"
                fontFamily="'IBM Plex Mono', 'Fira Code', monospace"
                fill="#64748b"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Nodes — wrap only if name genuinely exceeds node width */}
        {nodes.map((name, i) => {
          const isFirst = i === 0;
          const isLast = i === nodes.length - 1;
          const accentFill   = isFirst ? "#eff6ff" : isLast ? "#f0fdf4" : "#fafafa";
          const accentStroke = isFirst ? "#3b82f6" : isLast ? "#22c55e" : "#e2e8f0";
          const textColor    = isFirst ? "#1d4ed8" : isLast ? "#15803d" : "#0f172a";
          const dotColor     = isFirst ? "#3b82f6" : isLast ? "#22c55e" : "#94a3b8";
          const x = nx(i);
          const w = nodeWidths[i];
          const maxChars = charsForWidth(w);
          const needsWrap = name.length > maxChars;

          return (
            <g key={i} filter="url(#shadow)">
              <rect
                x={x} y={cy - NODE_H / 2}
                width={w} height={NODE_H}
                rx="10"
                fill={accentFill}
                stroke={accentStroke}
                strokeWidth="1.5"
              />
              <circle cx={x + 14} cy={cy} r="4" fill={dotColor} />
              <text
                x={x + 26}
                dominantBaseline="middle"
                fontSize="11.5"
                fontWeight="600"
                fontFamily="'IBM Plex Mono', 'Fira Code', monospace"
                fill={textColor}
              >
                {needsWrap ? (
                  <>
                    <tspan x={x + 26} y={cy - 8}>{name.slice(0, maxChars)}</tspan>
                    <tspan x={x + 26} y={cy + 8}>{name.slice(maxChars)}</tspan>
                  </>
                ) : (
                  <tspan x={x + 26} y={cy}>{name}</tspan>
                )}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
