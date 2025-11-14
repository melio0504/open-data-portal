import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { query, queryOne } from '../lib/db';
import { PublisherSchema, PublisherListQuerySchema, PaginationInfoSchema, createApiResponseSchema } from '../lib/schemas';
import { calculatePagination } from '../lib/utils';
import type { Publisher } from '../lib/types';

const app = new OpenAPIHono();

const listPublishersRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Publishers'],
  summary: 'List all publishers',
  description: 'Get a paginated list of publishers',
  request: {
    query: PublisherListQuerySchema,
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: createApiResponseSchema(PublisherSchema.array()).extend({
            pagination: PaginationInfoSchema,
          }),
        },
      },
    },
  },
});

app.openapi(listPublishersRoute, async (c: any) => {
  const { search, limit, offset } = c.req.valid('query');

  try {
    const params: any[] = [];
    let whereClause = '1=1';

    if (search) {
      whereClause = 'p.name LIKE ?';
      params.push(`%${search}%`);
    }

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM publishers p WHERE ${whereClause}`;
    const countResult = await queryOne<{ total: number }>(countSql, params);
    const total = countResult?.total || 0;

    // Data query
    const dataSql = `
      SELECT p.*
      FROM publishers p
      WHERE ${whereClause}
      ORDER BY p.name ASC
      LIMIT ? OFFSET ?
    `;

    const publishers = await query<Publisher>(dataSql, [...params, limit, offset]);

    return c.json({
      success: true,
      data: publishers,
      pagination: calculatePagination(total, limit, offset),
    });
  } catch (error) {
    console.error('Error listing publishers:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve publishers',
        },
      },
      500
    );
  }
});

export default app;
