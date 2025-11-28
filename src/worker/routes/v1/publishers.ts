/** biome-ignore-all lint/suspicious/noExplicitAny: any is acceptable in Hono routes */
import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { query, queryOne } from "../../lib/db.ts"
import {
  createApiResponseSchema,
  PaginationInfoSchema,
  PublisherListQuerySchema,
  PublisherSchema,
} from "../../lib/schemas.ts"
import type { Publisher } from "../../lib/types.ts"
import { calculatePagination } from "../../lib/utils.ts"

const app = new OpenAPIHono()

const listPublishersRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Publishers"],
  summary: "List all publishers",
  description: "Get a paginated list of publishers",
  request: {
    query: PublisherListQuerySchema,
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: createApiResponseSchema(PublisherSchema.array()).extend({
            pagination: PaginationInfoSchema,
          }),
        },
      },
    },
  },
})

app.openapi(listPublishersRoute, async (c: any) => {
  const { search, limit, offset } = c.req.valid("query")

  try {
    const params: any[] = []
    let whereClause = "1=1"

    if (search) {
      whereClause = "p.name LIKE ?"
      params.push(`%${search}%`)
    }

    const countSql = `SELECT COUNT(*) as total FROM publishers p WHERE ${whereClause}`
    const countResult = await queryOne<{ total: number }>(countSql, params)
    const total = countResult?.total || 0

    const dataSql = `
      SELECT p.*
      FROM publishers p
      WHERE ${whereClause}
      ORDER BY p.name ASC
      LIMIT ? OFFSET ?
    `

    const publishers = await query<Publisher>(dataSql, [
      ...params,
      limit,
      offset,
    ])

    return c.json({
      success: true,
      data: publishers,
      pagination: calculatePagination(total, limit, offset),
    })
  } catch (error) {
    console.error("Error listing publishers:", error)
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve publishers",
        },
      },
      500,
    )
  }
})

export default app
