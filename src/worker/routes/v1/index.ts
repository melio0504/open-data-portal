import { OpenAPIHono } from "@hono/zod-openapi"
import type { Bindings } from "../../lib/types.ts"
import categoriesRoutes from "./categories.ts"
import datasetsRoutes from "./datasets.ts"
import pingRoutes from "./ping.ts"
import publishersRoutes from "./publishers.ts"
import resourcesRoutes from "./resources.ts"
import statsRoutes from "./stats.ts"

export const apiV1Routes = new OpenAPIHono<{ Bindings: Bindings }>()
  .route("/datasets", datasetsRoutes)
  .route("/publishers", publishersRoutes)
  .route("/categories", categoriesRoutes)
  .route("/resources", resourcesRoutes)
  .route("/stats", statsRoutes)
  .route("/ping", pingRoutes)
