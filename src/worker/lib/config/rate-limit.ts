import type { RateLimitConfig } from "../rate-limiter.ts"

export type RateLimitTier =
  | "search"
  | "list"
  | "stats"
  | "detail"
  | "ping"
  | "default"

export const RATE_LIMIT_CONFIG: Record<RateLimitTier, RateLimitConfig> = {
  search: {
    windowMs: 60_000,
    maxRequests: 60,
  },
  list: {
    windowMs: 60_000,
    maxRequests: 60,
  },
  stats: {
    windowMs: 60_000,
    maxRequests: 60,
  },
  detail: {
    windowMs: 60_000,
    maxRequests: 100,
  },
  ping: {
    windowMs: 60_000,
    maxRequests: 1_000,
  },
  default: {
    windowMs: 60_000,
    maxRequests: 100,
  },
}
