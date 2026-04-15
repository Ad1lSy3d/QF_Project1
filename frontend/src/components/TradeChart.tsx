import { useState, useEffect, useRef, useCallback } from "react";
import type { AllPairsChartData } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface TradeChartProps {
  allPairs: AllPairsChartData[];
  selectedPair: string;
  onSelectPair: (pair: string) => void;
}

export function TradeChart({ allPairs, selectedPair, onSelectPair }: TradeChartProps) {
  const [visibleCount, setVisibleCount] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxSteps = Math.max(...allPairs.map(p => p.detail.trades.length), 0);

  useEffect(() => {
    setVisibleCount(1);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setVisibleCount((c) => {
        if (c >= maxSteps) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return maxSteps;
        }
        return c + 1;
      });
    }, 40);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [maxSteps]);

  // Build merged data: each row has step + equity for each pair
  const mergedData = [];
  for (let i = 0; i < visibleCount; i++) {
    const row: Record<string, number> = { step: i };
    for (const p of allPairs) {
      if (i < p.detail.trades.length) {
        row[p.pair] = p.detail.trades[i].equity;
      }
    }
    mergedData.push(row);
  }

  const latest = allPairs.find(p => p.pair === selectedPair);
  const latestEquity = latest?.detail.trades[Math.min(visibleCount - 1, latest.detail.trades.length - 1)]?.equity;

  const handleLineClick = useCallback((pair: string) => {
    onSelectPair(pair);
  }, [onSelectPair]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Live Chart</h3>
          <span className="font-mono text-foreground font-semibold">{selectedPair}</span>
        </div>
        {latestEquity !== undefined && (
          <span className={`font-mono text-sm ${latestEquity >= 10000 ? "text-profit" : "text-loss"}`}>
            ₹{latestEquity.toLocaleString()}
          </span>
        )}
      </div>

      {/* Legend - max 2 visible, scrollable */}
      <div className="max-h-[44px] overflow-y-auto hover:max-h-[120px] transition-all duration-300 flex flex-wrap gap-1.5">
        {allPairs.map(p => (
          <button
            key={p.pair}
            onClick={() => onSelectPair(p.pair)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
              p.pair === selectedPair
                ? "bg-accent border border-primary/30 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            {p.pair}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0" style={{ minHeight: "220px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis dataKey="step" hide />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "hsl(215, 15%, 50%)", fontSize: 11 }}
              tickFormatter={(v: number) => `₹${(v / 1000).toFixed(1)}k`}
              width={55}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine y={10000} stroke="hsl(220, 14%, 18%)" strokeDasharray="4 4" />
            <Tooltip
              contentStyle={{
                background: "hsl(220, 18%, 9%)",
                border: "1px solid hsl(220, 14%, 16%)",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "JetBrains Mono",
              }}
              labelFormatter={(l: number) => `Step ${l}`}
              formatter={(v: number, name: string) => [`₹${v.toLocaleString()}`, name]}
            />
            {allPairs.map(p => (
              <Line
                key={p.pair}
                type="monotone"
                dataKey={p.pair}
                stroke={p.color}
                strokeWidth={p.pair === selectedPair ? 2.5 : 1.5}
                strokeOpacity={p.pair === selectedPair ? 1 : 0.2}
                dot={false}
                isAnimationActive={false}
                style={{ cursor: "pointer" }}
                onClick={() => handleLineClick(p.pair)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground font-mono">
        <span>Steps: {visibleCount}/{maxSteps}</span>
        <span>Pairs: {allPairs.length}</span>
      </div>
    </div>
  );
}
