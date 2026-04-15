import type { ModelType, PairDetail, SummaryRow } from "./types";

const BASE_URL = "/api"; // placeholder base

export async function fetchSummary(): Promise<SummaryRow[]> {
  try {
    const res = await fetch(`${BASE_URL}/summary`);
    if (res.ok) return res.json();
  } catch {}
  return [];
}

export async function fetchPairDetail(pairName: string): Promise<PairDetail | null> {
  try {
    const res = await fetch(`${BASE_URL}/pair/${encodeURIComponent(pairName)}`);
    if (res.ok) return res.json();
  } catch {}
  return null;
}

export async function runBacktest(): Promise<unknown> {
  try {
    const res = await fetch(`${BASE_URL}/run`);
    if (res.ok) return res.json();
  } catch {}
  return null;
}

export async function reloadData(): Promise<unknown> {
  try {
    const res = await fetch(`${BASE_URL}/reload`);
    if (res.ok) return res.json();
  } catch {}
  return null;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/`);
    return res.ok;
  } catch {
    return false;
  }
}
