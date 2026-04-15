import { useState } from "react";
import type { PairDetail, TradeRecord } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PairDetailsPanelProps {
  detail: PairDetail | null;
  onSelectTrade?: (tradeIndex: number) => void;
}

export function PairDetailsPanel({ detail, onSelectTrade }: PairDetailsPanelProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTradeIdx, setSelectedTradeIdx] = useState<number | null>(null);

  const displayTrade = selectedTradeIdx !== null && detail
    ? detail.trades[selectedTradeIdx]
    : detail?.trades[detail.trades.length - 1] ?? null;

  const handleTradeClick = (idx: number) => {
    setSelectedTradeIdx(idx);
    onSelectTrade?.(idx);
  };

  return (
    <AnimatePresence mode="wait">
      {detail && (
        <motion.div
          key={detail.pair + detail.model}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trade Details</h3>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-mono font-semibold ${detail.totalPnl >= 0 ? "text-profit" : "text-loss"}`}>
                {detail.totalPnl >= 0 ? "PROFIT" : "LOSS"}
              </span>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                {showHistory ? "Close History" : "Trade History"}
              </button>
            </div>
          </div>

          {/* Trade History Panel */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <ScrollArea className="max-h-48 rounded-lg border border-border bg-background/50">
                  <div className="p-2 space-y-0.5">
                    {detail.trades.filter(t => t.action !== "HOLD").map((t, i) => {
                      const realIdx = detail.trades.indexOf(t);
                      return (
                        <button
                          key={realIdx}
                          onClick={() => handleTradeClick(realIdx)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                            selectedTradeIdx === realIdx
                              ? "bg-primary/10 border border-primary/30 text-foreground"
                              : "hover:bg-accent text-muted-foreground"
                          }`}
                        >
                          <span>Step {t.step}</span>
                          <span className={t.action === "LONG_SPREAD" ? "text-profit" : "text-loss"}>
                            {t.action.replace("_SPREAD", "")}
                          </span>
                          <span className={t.pnl >= 0 ? "text-profit" : "text-loss"}>
                            ₹{t.pnl.toLocaleString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trade details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Detail label="Pair" value={detail.pair} />
            <Detail label="Model" value={detail.model} />
            <Detail label="Final Equity" value={`₹${detail.finalEquity.toLocaleString()}`} />
            <Detail label="Total PnL" value={`₹${detail.totalPnl.toLocaleString()}`} color={detail.totalPnl >= 0} />
            <Detail label="Sharpe" value={detail.sharpeRatio.toString()} />
            <Detail label="Max DD" value={`${detail.maxDrawdown}%`} />
            <Detail label="Alpha" value={detail.alpha.toString()} color={detail.alpha >= 0} />
            <Detail label="Trades" value={detail.numTrades.toString()} />
            {displayTrade && (
              <>
                <Detail label="Entry Price" value={`₹${displayTrade.entryPrice?.toLocaleString() ?? "—"}`} />
                <Detail label="Exit Price" value={`₹${displayTrade.exitPrice?.toLocaleString() ?? "—"}`} />
                <Detail label="Quantity" value={displayTrade.quantity?.toString() ?? "—"} />
                <Detail label="Total Cost" value={`₹${displayTrade.totalCost?.toLocaleString() ?? "—"}`} />
                <Detail label="Entry Time" value={displayTrade.entryTime ?? "—"} />
                <Detail label="Exit Time" value={displayTrade.exitTime ?? "—"} />
              </>
            )}
          </div>

          <div className="pt-2">
            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Recent Actions</h4>
            <div className="flex flex-wrap gap-1.5">
              {detail.trades.slice(-15).map((t, i) => (
                <span
                  key={i}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    t.action === "LONG_SPREAD" ? "bg-profit/10 text-profit" :
                    t.action === "SHORT_SPREAD" ? "bg-loss/10 text-loss" :
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.action.replace("_SPREAD", "")}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Detail({ label, value, color }: { label: string; value: string; color?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-mono text-sm ${color === undefined ? "text-foreground" : color ? "text-profit" : "text-loss"}`}>
        {value}
      </span>
    </div>
  );
}
