import { OpenAPIHono } from "@hono/zod-openapi";
import type { Bindings } from "@/lib/types";
import categoriesRoutes from "./categories";
import datasetsRoutes from "./datasets";
import pingRoutes from "./ping";
import publishersRoutes from "./publishers";
import resourcesRoutes from "./resources";
import statsRoutes from "./stats";

// Create v1 API app
export const apiV1Routes = new OpenAPIHono<{ Bindings: Bindings }>()
  .route("/datasets", datasetsRoutes)
  .route("/publishers", publishersRoutes)
  .route("/categories", categoriesRoutes)
  .route("/resources", resourcesRoutes)
  .route("/stats", statsRoutes)
  .route("/ping", pingRoutes);
