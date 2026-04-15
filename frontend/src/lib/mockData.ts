import type { ModelType, PairInfo, PairDetail, SummaryRow, TradeRecord } from "./types";

const positivePairs: PairInfo[] = [
  { pair: "AAPL-MSFT", stock1: "AAPL", stock2: "MSFT", correlation: 0.87, type: "positive" },
  { pair: "GOOGL-META", stock1: "GOOGL", stock2: "META", correlation: 0.82, type: "positive" },
  { pair: "JPM-GS", stock1: "JPM", stock2: "GS", correlation: 0.91, type: "positive" },
  { pair: "V-MA", stock1: "V", stock2: "MA", correlation: 0.89, type: "positive" },
  { pair: "XOM-CVX", stock1: "XOM", stock2: "CVX", correlation: 0.93, type: "positive" },
  { pair: "UNH-CI", stock1: "UNH", stock2: "CI", correlation: 0.78, type: "positive" },
];

const negativePairs: PairInfo[] = [
  { pair: "AAPL-XOM", stock1: "AAPL", stock2: "XOM", correlation: -0.65, type: "negative" },
  { pair: "TSLA-F", stock1: "TSLA", stock2: "F", correlation: -0.52, type: "negative" },
  { pair: "AMZN-WMT", stock1: "AMZN", stock2: "WMT", correlation: -0.48, type: "negative" },
  { pair: "NFLX-DIS", stock1: "NFLX", stock2: "DIS", correlation: -0.41, type: "negative" },
];

function generateTrades(seed: number, model: ModelType): TradeRecord[] {
  const trades: TradeRecord[] = [];
  let equity = 10000;
  const steps = 60 + Math.floor(seed * 20);
  const actions: TradeRecord["action"][] = ["LONG_SPREAD", "SHORT_SPREAD", "HOLD"];
  const volatility = model === "SAC" ? 0.015 : 0.018;

  for (let i = 0; i < steps; i++) {
    const noise = (Math.sin(seed * 100 + i * 0.7) * 0.5 + 0.5);
    const change = (noise - 0.45) * volatility * equity;
    equity += change;
    const action = actions[Math.floor((Math.sin(seed * 50 + i * 1.3) + 1) * 1.5) % 3];
    const entryPrice = Math.round((500 + Math.sin(seed * 30 + i) * 200) * 100) / 100;
    const exitPrice = Math.round((entryPrice + change / 10) * 100) / 100;
    const quantity = Math.floor(10000 / entryPrice);
    trades.push({
      step: i,
      action,
      equity: Math.round(equity * 100) / 100,
      pnl: Math.round(change * 100) / 100,
      spread: Math.round((Math.sin(i * 0.3 + seed) * 2 + 5) * 100) / 100,
      entryPrice,
      exitPrice,
      quantity,
      totalCost: Math.round(entryPrice * quantity * 100) / 100,
      entryTime: `2025-01-${String(Math.floor(i / 3) + 1).padStart(2, "0")} 09:${String(30 + (i % 30)).padStart(2, "0")}`,
      exitTime: `2025-01-${String(Math.floor(i / 3) + 1).padStart(2, "0")} 15:${String((i % 30)).padStart(2, "0")}`,
    });
  }
  return trades;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h) / 2147483647;
}

export function getMockPairs(): { positive: PairInfo[]; negative: PairInfo[] } {
  return { positive: positivePairs, negative: negativePairs };
}

export function getMockPairDetail(pair: string, model: ModelType): PairDetail {
  const seed = hashStr(pair + model);
  const trades = generateTrades(seed, model);
  const finalEquity = trades[trades.length - 1].equity;
  const totalPnl = finalEquity - 10000;
  const pnls = trades.map(t => t.pnl);
  const avgPnl = pnls.reduce((a, b) => a + b, 0) / pnls.length;
  const std = Math.sqrt(pnls.reduce((a, b) => a + (b - avgPnl) ** 2, 0) / pnls.length) || 1;

  let peak = 10000, maxDd = 0;
  for (const t of trades) {
    if (t.equity > peak) peak = t.equity;
    const dd = (peak - t.equity) / peak;
    if (dd > maxDd) maxDd = dd;
  }

  return {
    pair,
    model,
    trades,
    finalEquity: Math.round(finalEquity * 100) / 100,
    totalPnl: Math.round(totalPnl * 100) / 100,
    sharpeRatio: Math.round((avgPnl / std) * Math.sqrt(252) * 100) / 100,
    maxDrawdown: Math.round(maxDd * 10000) / 100,
    numTrades: trades.filter(t => t.action !== "HOLD").length,
    alpha: Math.round((seed * 6 - 2) * 100) / 100,
  };
}

export function getMockSummary(model: ModelType): SummaryRow[] {
  const all = [...positivePairs, ...negativePairs];
  return all.map(p => {
    const d = getMockPairDetail(p.pair, model);
    return {
      pair: p.pair,
      type: p.type,
      profit: d.totalPnl,
      numTrades: d.numTrades,
      sharpeRatio: d.sharpeRatio,
      maxDrawdown: d.maxDrawdown,
      model,
    };
  });
}
