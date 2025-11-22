/** biome-ignore-all lint/suspicious/noExplicitAny: any is acceptable in Hono routes */
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { queryOne } from "../../lib/db";
import { ErrorSchema, StatsSchema } from "../../lib/schemas";
import type { Stats } from "../../lib/types";

const app = new OpenAPIHono();

const getStatsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Statistics"],
  summary: "Get platform statistics",
  description: "Retrieve platform-wide statistics including counts and totals",
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
  },
});

app.openapi(getStatsRoute, async (c: any) => {
  try {
    const statsSql = `
      SELECT
        (SELECT COUNT(*) FROM datasets) as total_datasets,
        (SELECT COUNT(*) FROM resources) as total_resources,
        (SELECT COUNT(*) FROM publishers) as total_publishers,
        (SELECT COUNT(*) FROM categories) as total_categories,
        (SELECT COALESCE(SUM(size_bytes), 0) FROM datasets) as total_size_bytes
    `;

    const stats = await queryOne<Stats>(statsSql, []);

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve statistics",
        },
      },
      500,
    );
  }
});

export default app;
