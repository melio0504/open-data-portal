/** biome-ignore-all lint/suspicious/noExplicitAny: any is acceptable in Hono routes */
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { RATE_LIMIT_CONFIG } from "../../lib/config/rate-limit.ts"
import { query } from "../../lib/db.ts"
import { rateLimit } from "../../lib/middleware/rate-limit.ts"
import {
  CategoryListItemSchema,
  ErrorSchema,
  RateLimitErrorResponseSchema,
} from "../../lib/schemas.ts"
import type { Bindings, CategoryListItem } from "../../lib/types.ts"

const app = new OpenAPIHono<{ Bindings: Bindings }>()
app.use("/", rateLimit({ config: RATE_LIMIT_CONFIG.list }))

const listCategoriesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Categories"],
  summary: "List all categories",
  description:
    "Get a list of all categories. Rate limit: 60 requests per minute.",
  request: {
    query: z.object({
      search: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: CategoryListItemSchema.array().optional(),
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

app.openapi(listCategoriesRoute, async (c: any) => {
  const { search } = c.req.valid("query")

  try {
    const params: any[] = []
    let whereClause = "1=1"

    if (search) {
      whereClause = "c.name LIKE ?"
      params.push(`%${search}%`)
    }

    const dataSql = `
      SELECT
        c.*,
        (SELECT COUNT(*) FROM datasets d WHERE d.category_id = c.id) as dataset_count,
        (SELECT COUNT(*) FROM resources r
         INNER JOIN datasets d ON r.dataset_id = d.id
         WHERE d.category_id = c.id) as resource_count
      FROM categories c
      WHERE ${whereClause}
      ORDER BY c.name ASC
    `

    const categories = await query<CategoryListItem>(dataSql, params)

    return c.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Error listing categories:", error)
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve categories",
        },
      },
      500,
    )
  }
})

export default app
