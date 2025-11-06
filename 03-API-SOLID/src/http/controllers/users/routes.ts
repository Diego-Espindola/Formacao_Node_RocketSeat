import type { FastifyInstance } from "fastify";
import { register } from "./register.controller.js";
import { authenticate } from "./authenticate.controller.js";
import { profile } from "./profile.controller.js";
import { verifyJwt } from "@/http/middlewares/verify-jwt.js";

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', register);
  app.post('/sessions', authenticate);

  /** Authenticated */
  app.get('/me', { onRequest: [verifyJwt] }, profile)
}