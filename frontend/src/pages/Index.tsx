import { useState, useMemo, useCallback } from "react";
import type { ModelType, AllPairsChartData } from "@/lib/types";
import { getMockPairs, getMockPairDetail, getMockSummary } from "@/lib/mockData";
import { ModelSwitcher } from "@/components/ModelSwitcher";
import { StatsCard } from "@/components/StatsCard";
import { PairList } from "@/components/PairList";
import { TradeChart } from "@/components/TradeChart";
import { PairDetailsPanel } from "@/components/PairDetailsPanel";
import { SummaryTable } from "@/components/SummaryTable";
import { PipelineVisual } from "@/components/PipelineVisual";
import { motion } from "framer-motion";

const PAIR_COLORS = [
  "hsl(160, 60%, 45%)", "hsl(210, 70%, 55%)", "hsl(40, 80%, 55%)",
  "hsl(280, 50%, 55%)", "hsl(0, 62%, 55%)", "hsl(120, 45%, 50%)",
  "hsl(330, 55%, 55%)", "hsl(190, 65%, 50%)", "hsl(60, 70%, 50%)",
  "hsl(240, 50%, 60%)",
];

export default function Index() {
  const [model, setModel] = useState<ModelType>("SAC");
  const [selectedPair, setSelectedPair] = useState<string>("AAPL-MSFT");

  const pairs = useMemo(() => getMockPairs(), []);
  const allPairNames = useMemo(() => [...pairs.positive, ...pairs.negative].map(p => p.pair), [pairs]);

  const allPairsData: AllPairsChartData[] = useMemo(() =>
    allPairNames.map((pair, i) => ({
      pair,
      detail: getMockPairDetail(pair, model),
      color: PAIR_COLORS[i % PAIR_COLORS.length],
    })),
    [allPairNames, model]
  );

  const detail = useMemo(() => getMockPairDetail(selectedPair, model), [selectedPair, model]);
  const summary = useMemo(() => getMockSummary(model), [model]);

  const stats = useMemo(() => ({
    initialAmount: 10000,
    sharpeRatio: detail.sharpeRatio,
    alpha: detail.alpha,
    maxDrawdown: detail.maxDrawdown,
    avgPnl: Math.round((detail.totalPnl / detail.numTrades) * 100) / 100,
    finalEquity: detail.finalEquity,
    totalPnl: detail.totalPnl,
    numTrades: detail.numTrades,
  }), [detail]);

  const handlePairSelect = useCallback((pair: string) => setSelectedPair(pair), []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h1 className="text-base font-semibold text-foreground tracking-tight">GNN + RL Trading</h1>
            <span className="text-xs text-muted-foreground hidden sm:inline">Quantitative Finance Research</span>
          </div>
          <ModelSwitcher model={model} onChange={setModel} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Pipeline */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <PipelineVisual />
        </motion.section>

        {/* Hero Dashboard */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 space-y-5">
            <StatsCard stats={stats} />
            <PairDetailsPanel detail={detail} />
          </div>
          <div className="lg:col-span-2">
            <TradeChart
              allPairs={allPairsData}
              selectedPair={selectedPair}
              onSelectPair={handlePairSelect}
            />
          </div>
        </section>

        {/* Pair Listings */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PairList
            title="Positive Pairs"
            pairs={pairs.positive}
            selectedPair={selectedPair}
            onSelect={handlePairSelect}
            variant="positive"
          />
          <PairList
            title="Negative Pairs"
            pairs={pairs.negative}
            selectedPair={selectedPair}
            onSelect={handlePairSelect}
            variant="negative"
          />
        </section>

        {/* Summary Table */}
        <section>
          <SummaryTable rows={summary} />
        </section>
      </main>

      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>GNN + RL Trading — GNN + RL Pairs Trading Pipeline</span>
          <span>Capital per trade: ₹10,000</span>
        </div>
      </footer>
    </div>
  );
}
