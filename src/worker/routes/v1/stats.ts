/** biome-ignore-all lint/suspicious/noExplicitAny: any is acceptable in Hono routes */
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { RATE_LIMIT_CONFIG } from "../../lib/config/rate-limit.ts"
import { queryOne } from "../../lib/db.ts"
import { rateLimit } from "../../lib/middleware/rate-limit.ts"
import {
  ErrorSchema,
  RateLimitErrorResponseSchema,
  StatsSchema,
} from "../../lib/schemas.ts"
import type { Stats } from "../../lib/types.ts"

const app = new OpenAPIHono()
app.use("/", rateLimit({ config: RATE_LIMIT_CONFIG.stats }))

const getStatsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Statistics"],
  summary: "Get platform statistics",
  description:
    "Retrieve platform-wide statistics including counts and totals. Rate limit: 30 requests per minute.",
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: StatsSchema.optional(),
            error: ErrorSchema.optional(),
          }),
        },
      },
    },
    429: {
      description: "Rate limit exceeded",
      content: {
        "application/json": {
          schema: RateLimitErrorResponseSchema,
        },
      },
    },
  },
})

app.openapi(getStatsRoute, async (c: any) => {
  try {
    const statsSql = `
      SELECT
        (SELECT COUNT(*) FROM datasets) as total_datasets,
        (SELECT COUNT(*) FROM resources) as total_resources,
        (SELECT COUNT(*) FROM publishers) as total_publishers,
        (SELECT COUNT(*) FROM categories) as total_categories,
        (SELECT COALESCE(SUM(size_bytes), 0) FROM datasets) as total_size_bytes
    `

    const stats = await queryOne<Stats>(statsSql, [])

    return c.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error getting stats:", error)
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve statistics",
        },
      },
      500,
    )
  }
})

export default app
