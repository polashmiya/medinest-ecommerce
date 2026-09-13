import { currencyConfig } from "@/config/commerce.config";

/**
 * Deterministic number formatting (identical on server and client, so no
 * hydration mismatches caused by differing ICU data).
 */
export function formatNumber(value: number, decimals = 0) {
  const fixed = Math.abs(value).toFixed(decimals);
  const [int, frac] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, currencyConfig.thousandSeparator);
  const sign = value < 0 ? "-" : "";
  return frac ? `${sign}${grouped}${currencyConfig.decimalSeparator}${frac}` : `${sign}${grouped}`;
}

export function formatPrice(value: number, opts: { decimals?: number; symbol?: boolean } = {}) {
  const decimals = opts.decimals ?? currencyConfig.decimals;
  const rounded = Math.round(value * 10 ** decimals) / 10 ** decimals;
  const whole = Number.isInteger(rounded);
  const body = formatNumber(rounded, currencyConfig.trimZeros && whole ? 0 : decimals);
  if (opts.symbol === false) return body;
  return currencyConfig.symbolPosition === "before" ? `${currencyConfig.symbol}${body}` : `${body}${currencyConfig.symbol}`;
}

/** 12,345 → "12.3K" */
export function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Stable, locale-independent date output: "12 Sep 2026". */
export function formatDate(input: string | number | Date, withTime = false) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  if (!withTime) return date;
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${date}, ${((h + 11) % 12) + 1}:${m} ${h >= 12 ? "PM" : "AM"}`;
}

export function percentOff(mrp: number, price: number) {
  if (!mrp || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
