import { swaggerUI } from "@hono/swagger-ui"
import { OpenAPIHono } from "@hono/zod-openapi"
import { initDB } from "./lib/db.ts"
import type { Bindings } from "./lib/types.ts"
import { apiV1Routes } from "./routes/v1"

const app = new OpenAPIHono<{ Bindings: Bindings }>()

app.use("/*", async (c, next) => {
  initDB(c.env.DB)
  await next()
})

app.route("/api/v1", apiV1Routes)

app.doc("/openapi/v1.json", (c) => ({
  openapi: "3.1.0",
  info: {
    title: "Open Data Portal API",
    version: "1.0.0",
    description:
      "Public API for accessing open datasets with search, filtering, and pagination capabilities.",
  },
  servers: [
    {
      url: new URL(c.req.url).origin,
      description: "Open Data Portal API v1",
    },
  ],
}))

app.doc("/openapi.json", (c) => ({
  openapi: "3.1.0",
  info: {
    title: "Open Data Portal API",
    version: "1.0.0",
    description:
      "Public API for accessing open datasets with search, filtering, and pagination capabilities.",
  },
  servers: [
    {
      url: new URL(c.req.url).origin,
      description: "Open Data Portal API (latest: v1)",
    },
  ],
}))

app.get("/docs/v1", swaggerUI({ url: "/openapi/v1.json" }))
app.get("/docs", swaggerUI({ url: "/openapi.json" }))

app.get("*", async (c) => {
  const path = c.req.path
  // Only serve assets for non-API/docs routes
  if (
    !path.startsWith("/api/") &&
    !path.startsWith("/docs") &&
    !path.startsWith("/openapi")
  ) {
    return c.env.ASSETS.fetch(c.req.raw)
  }
  // Let API/docs routes that don't match continue to notFound handler
  return c.notFound()
})

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Endpoint not found",
      },
    },
    404,
  )
})

app.onError((err, c) => {
  console.error(err)
  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    },
    500,
  )
})

export default app
