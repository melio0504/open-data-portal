/** biome-ignore-all lint/suspicious/noExplicitAny: any is acceptable in Hono routes */
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { RATE_LIMIT_CONFIG } from "../../lib/config/rate-limit.ts"
import { query, queryOne } from "../../lib/db.ts"
import { rateLimit } from "../../lib/middleware/rate-limit.ts"
import {
  createApiResponseSchema,
  ErrorResponseSchema,
  PaginationInfoSchema,
  RateLimitErrorResponseSchema,
  ResourceSchema,
} from "../../lib/schemas.ts"
import type { Resource } from "../../lib/types.ts"
import { calculatePagination } from "../../lib/utils.ts"

const app = new OpenAPIHono()
app.use("/", rateLimit({ config: RATE_LIMIT_CONFIG.list }))
app.use("/:id", rateLimit({ config: RATE_LIMIT_CONFIG.detail }))

const listResourcesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Resources"],
  summary: "List resources for a dataset",
  description:
    "Get a paginated list of resources for a specific dataset. Rate limit: 60 requests per minute.",
  request: {
    query: z.object({
      dataset_id: z.coerce
        .number()
        .int()
        .positive()
        .describe("Dataset ID to filter resources (required)"),
      limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10)
        .describe("Number of items per page"),
      offset: z.coerce
        .number()
        .int()
        .min(0)
        .default(0)
        .describe("Number of items to skip"),
    }),
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: createApiResponseSchema(ResourceSchema.array()).extend({
            pagination: PaginationInfoSchema,
          }),
        },
      },
    },
    400: {
      description: "Bad request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
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

app.openapi(listResourcesRoute, async (c: any) => {
  const { dataset_id, limit, offset } = c.req.valid("query")

  try {
    const countSql = `
      SELECT COUNT(*) as total
      FROM resources
      WHERE dataset_id = ?
    `
    const countResult = await queryOne<{ total: number }>(countSql, [
      dataset_id,
    ])
    const total = countResult?.total || 0

    const dataSql = `
      SELECT *
      FROM resources
      WHERE dataset_id = ?
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `

    const resources = await query<Resource>(dataSql, [
      dataset_id,
      limit,
      offset,
    ])

    return c.json({
      success: true,
      data: resources,
      pagination: calculatePagination(total, limit, offset),
    })
  } catch (error) {
    console.error("Error listing resources:", error)
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve resources",
        },
      },
      500,
    )
  }
})

const getResourceRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Resources"],
  summary: "Get resource details",
  description:
    "Get full details of a specific resource. Rate limit: 100 requests per minute.",
  request: {
    params: z.object({
      id: z.coerce.number().int().positive(),
    }),
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: createApiResponseSchema(ResourceSchema),
        },
      },
    },
    404: {
      description: "Resource not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
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

app.openapi(getResourceRoute, async (c: any) => {
  const { id } = c.req.valid("param")

  try {
    const resourceSql = `
      SELECT *
      FROM resources
      WHERE id = ?
    `

    const resource = await queryOne<Resource>(resourceSql, [id])

    if (!resource) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Resource not found",
          },
        },
        404,
      )
    }

    return c.json({
      success: true,
      data: resource,
    })
  } catch (error) {
    console.error("Error getting resource:", error)
    return c.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve resource",
        },
      },
      500,
    )
  }
})

export default app
