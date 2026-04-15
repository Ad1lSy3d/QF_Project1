import type { Stats } from "@/lib/types";
import { motion } from "framer-motion";

interface StatsCardProps {
  stats: Stats;
}

function Stat({ label, value, prefix = "", suffix = "", isPositive }: {
  label: string; value: number; prefix?: string; suffix?: string; isPositive?: boolean;
}) {
  const color = isPositive === undefined
    ? "text-foreground"
    : isPositive ? "text-profit" : "text-loss";

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-lg font-semibold font-mono ${color}`}
      >
        {prefix}{typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}{suffix}
      </motion.span>
    </div>
  );
}

export function StatsCard({ stats }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Portfolio Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Initial Capital" value={stats.initialAmount} prefix="₹" />
        <Stat label="Final Equity" value={stats.finalEquity} prefix="₹" isPositive={stats.finalEquity >= stats.initialAmount} />
        <Stat label="Total PnL" value={stats.totalPnl} prefix="₹" isPositive={stats.totalPnl >= 0} />
        <Stat label="Avg PnL" value={stats.avgPnl} prefix="₹" isPositive={stats.avgPnl >= 0} />
        <Stat label="Sharpe Ratio" value={stats.sharpeRatio} isPositive={stats.sharpeRatio > 0} />
        <Stat label="Alpha" value={stats.alpha} isPositive={stats.alpha > 0} />
        <Stat label="Max Drawdown" value={stats.maxDrawdown} suffix="%" isPositive={false} />
        <Stat label="Trades" value={stats.numTrades} />
      </div>
    </div>
  );
}
