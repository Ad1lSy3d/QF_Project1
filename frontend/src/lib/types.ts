export type ModelType = "SAC" | "PPO";

export interface PairInfo {
  pair: string;
  stock1: string;
  stock2: string;
  correlation?: number;
  type: "positive" | "negative";
}

export interface TradeRecord {
  step: number;
  action: "LONG_SPREAD" | "SHORT_SPREAD" | "HOLD";
  equity: number;
  pnl: number;
  spread: number;
  timestamp?: string;
  entryPrice?: number;
  exitPrice?: number;
  quantity?: number;
  totalCost?: number;
  entryTime?: string;
  exitTime?: string;
}

export interface PairDetail {
  pair: string;
  model: ModelType;
  trades: TradeRecord[];
  finalEquity: number;
  totalPnl: number;
  sharpeRatio: number;
  maxDrawdown: number;
  numTrades: number;
  alpha: number;
}

export interface SummaryRow {
  pair: string;
  type: "positive" | "negative";
  profit: number;
  numTrades: number;
  sharpeRatio: number;
  maxDrawdown: number;
  model: ModelType;
}

export interface Stats {
  initialAmount: number;
  sharpeRatio: number;
  alpha: number;
  maxDrawdown: number;
  avgPnl: number;
  finalEquity: number;
  totalPnl: number;
  numTrades: number;
}

export interface AllPairsChartData {
  pair: string;
  detail: PairDetail;
  color: string;
}
