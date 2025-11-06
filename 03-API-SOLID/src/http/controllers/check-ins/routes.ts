import type { FastifyInstance } from "fastify";
import { verifyJwt } from "@/http/middlewares/verify-jwt.js";
import { create } from "./create.controller.js";
import { validate } from "./validate.controller.js";
import { history } from "./history.controller.js";
import { metrics } from "./metrics.controller.js";

export async function checkInsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/check-ins/history', history)
  app.get('/check-ins/metrics', metrics)

  app.post('/gyms/:gymId/check-ins', create)
  app.patch('/check-ins/:checkInId/validate', validate)
}