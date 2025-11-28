/** biome-ignore-all lint/suspicious/noExplicitAny: any is acceptable in Hono routes */
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { query } from "../../lib/db.ts"
import { CategoryListItemSchema, ErrorSchema } from "../../lib/schemas.ts"
import type { Bindings, CategoryListItem } from "../../lib/types.ts"

const app = new OpenAPIHono<{ Bindings: Bindings }>()

const listCategoriesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Categories"],
  summary: "List all categories",
  description: "Get a list of all categories",
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
