import type { PairInfo } from "@/lib/types";
import { motion } from "framer-motion";

interface PairListProps {
  title: string;
  pairs: PairInfo[];
  selectedPair: string | null;
  onSelect: (pair: string) => void;
  variant: "positive" | "negative";
}

export function PairList({ title, pairs, selectedPair, onSelect, variant }: PairListProps) {
  const dotColor = variant === "positive" ? "bg-profit" : "bg-loss";

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">{pairs.length}</span>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
        {pairs.map((p, i) => (
          <motion.button
            key={p.pair}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect(p.pair)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedPair === p.pair
                ? "bg-primary/10 border border-primary/30 text-foreground"
                : "hover:bg-accent text-secondary-foreground"
            }`}
          >
            <span className="font-mono font-medium">{p.pair}</span>
            {p.correlation !== undefined && (
              <span className={`text-xs font-mono ${variant === "positive" ? "text-profit" : "text-loss"}`}>
                ρ {p.correlation.toFixed(2)}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
