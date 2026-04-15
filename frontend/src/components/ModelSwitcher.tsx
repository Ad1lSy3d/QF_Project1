import type { ModelType } from "@/lib/types";
import { motion } from "framer-motion";

interface ModelSwitcherProps {
  model: ModelType;
  onChange: (m: ModelType) => void;
}

export function ModelSwitcher({ model, onChange }: ModelSwitcherProps) {
  return (
    <div className="relative flex rounded-lg bg-secondary p-1 gap-1">
      {(["SAC", "PPO"] as ModelType[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className="relative z-10 px-4 py-1.5 text-sm font-medium transition-colors rounded-md"
          style={{ color: model === m ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}
        >
          {model === m && (
            <motion.div
              layoutId="model-pill"
              className="absolute inset-0 rounded-md bg-primary"
              style={{ zIndex: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          {m}
        </button>
      ))}
    </div>
  );
}
