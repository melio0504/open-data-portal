import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const app = new OpenAPIHono();

const pingRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Health"],
  summary: "Health check",
  description: "Check if the API is running",
  responses: {
    200: {
      description: "API is healthy",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.object({
              status: z.string(),
              timestamp: z.string(),
            }),
          }),
        },
      },
    },
  },
});

app.openapi(pingRoute, async (c) => {
  return c.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

export default app;
