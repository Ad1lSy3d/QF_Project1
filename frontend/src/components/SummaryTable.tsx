import { useState } from "react";
import type { SummaryRow } from "@/lib/types";
import { motion } from "framer-motion";

interface SummaryTableProps {
  rows: SummaryRow[];
}

type SortKey = "pair" | "profit" | "numTrades" | "sharpeRatio" | "maxDrawdown";

export function SummaryTable({ rows }: SummaryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("profit");
  const [asc, setAsc] = useState(false);

  const toggle = (k: SortKey) => {
    if (sortKey === k) setAsc(!asc);
    else { setSortKey(k); setAsc(false); }
  };

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    const cmp = typeof av === "string" ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
    return asc ? cmp : -cmp;
  });

  const hdr = (label: string, key: SortKey) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
      onClick={() => toggle(key)}
    >
      {label} {sortKey === key ? (asc ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Backtest Summary</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {hdr("Pair", "pair")}
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
              {hdr("Profit", "profit")}
              {hdr("Trades", "numTrades")}
              {hdr("Sharpe", "sharpeRatio")}
              {hdr("Max DD", "maxDrawdown")}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <motion.tr
                key={r.pair}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border/50 hover:bg-accent/50 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-sm font-medium text-foreground">{r.pair}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                    r.type === "positive" ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                  }`}>
                    {r.type}
                  </span>
                </td>
                <td className={`px-4 py-3 font-mono text-sm ${r.profit >= 0 ? "text-profit" : "text-loss"}`}>
                  ₹{r.profit.toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-foreground">{r.numTrades}</td>
                <td className={`px-4 py-3 font-mono text-sm ${r.sharpeRatio > 0 ? "text-profit" : "text-loss"}`}>
                  {r.sharpeRatio}
                </td>
                <td className="px-4 py-3 font-mono text-sm text-loss">{r.maxDrawdown}%</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
