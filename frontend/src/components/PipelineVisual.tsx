import { motion } from "framer-motion";

const steps = [
  { label: "GNN", desc: "Graph Neural Network discovers correlated pairs" },
  { label: "Pairs", desc: "Positive & negative pairs identified" },
  { label: "RL Trading", desc: "SAC / PPO trades sequentially" },
  { label: "Backtest", desc: "Performance evaluated on historical data" },
  { label: "Dashboard", desc: "Results visualized here" },
];

export function PipelineVisual() {
  return (
    <div className="flex items-center justify-center gap-2 py-4 overflow-x-auto">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.12 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-secondary border border-border min-w-[90px]"
          >
            <span className="text-xs font-semibold text-primary font-mono">{s.label}</span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">{s.desc}</span>
          </motion.div>
          {i < steps.length - 1 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.12 + 0.06 }}
              className="text-muted-foreground text-lg"
            >
              →
            </motion.span>
          )}
        </div>
      ))}
    </div>
  );
}
