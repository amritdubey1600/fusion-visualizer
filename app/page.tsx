'use client';
import { useState } from "react";
import { PathGraph } from "@/components/pathGrapth";

export interface PathStep {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}


export default function Home() {
  const [result, setResult] = useState<string>("");
  const [routePath, setRoutePath] = useState<PathStep[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState({ fromTable: "", toTable: "" });

  async function fetchData() {
    if (!data.fromTable.trim() || !data.toTable.trim()) return;
    setLoading(true);
    setRoutePath(null);
    setResult("");
    setError(false);
    try {
      const res = await fetch(`/api?fromTable=${encodeURIComponent(data.fromTable)}&toTable=${encodeURIComponent(data.toTable)}`);
      const json = await res.json();
      setResult(json.message || json.error || "Unknown response");
      setError(!res.ok);
      setRoutePath(json.path ?? null);
    } catch {
      setResult("Network error — could not reach the server.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setData((prev) => ({ ...prev, [id]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") fetchData();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        body { background: #f8fafc; font-family: 'IBM Plex Sans', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-slate-50">

        {/* Top nav */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="3" cy="7" r="2" fill="white" />
                <circle cx="11" cy="4" r="2" fill="white" />
                <circle cx="11" cy="10" r="2" fill="white" />
                <line x1="5" y1="6.5" x2="9" y2="4.5" stroke="white" strokeWidth="1.2" />
                <line x1="5" y1="7.5" x2="9" y2="9.5" stroke="white" strokeWidth="1.2" />
              </svg>
            </div>
            <span className="font-semibold text-slate-800 text-sm tracking-tight">Fusion Visualizer</span>
          </div>
          <span className="text-slate-300 text-sm select-none">|</span>
          <span className="text-slate-400 text-xs font-mono">Table Relationship Explorer</span>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Find Join Path</h1>
            <p className="text-slate-500 text-sm mt-1">
              Enter a source and destination table to trace the relationship path across your data model.
            </p>
          </div>

          {/* Search card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">

              <div className="flex flex-col gap-1.5">
                <label htmlFor="fromTable" className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Source Table
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="4" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </span>
                  <input
                    id="fromTable"
                    value={data.fromTable}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. doo_headers_all"
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="hidden sm:flex items-center justify-center pb-3.5">
                <div className="flex items-center gap-1 text-slate-300">
                  <div className="w-6 h-px bg-slate-200" />
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="w-6 h-px bg-slate-200" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="toTable" className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Target Table
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="4" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </span>
                  <input
                    id="toTable"
                    value={data.toTable}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. doo_fulfill_lines_all"
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={loading || !data.fromTable.trim() || !data.toTable.trim()}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Searching…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8h12M8 2l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Find Path
                  </>
                )}
              </button>
              <span className="text-slate-400 text-xs">or press Enter</span>
            </div>
          </div>

          {/* Status banner */}
          {result && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium ${
              error
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}>
              {error ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {result}
            </div>
          )}

          {/* Result card */}
          {routePath && routePath.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold text-slate-700">Relationship Path</span>
                </div>
                <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                  {routePath.length} hop{routePath.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="px-6 py-8 bg-slate-50 border-b border-slate-100">
                <PathGraph path={routePath} />
              </div>

              <div className="px-6 py-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Join Conditions</p>
                <div className="flex flex-col divide-y divide-slate-100">
                  {routePath.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 flex-wrap">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap text-sm">
                        <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{step.fromTable}</span>
                        <span className="text-slate-400 font-mono text-xs">.{step.fromColumn}</span>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">JOIN</span>
                        <span className="font-mono font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">{step.toTable}</span>
                        <span className="text-slate-400 font-mono text-xs">.{step.toColumn}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}