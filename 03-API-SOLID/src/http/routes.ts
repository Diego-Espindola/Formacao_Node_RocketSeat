import type { FastifyInstance } from "fastify";
import { register } from "./controllers/register.controller.js";
import { authenticate } from "./controllers/authenticate.controller.js";
import { profile } from "./controllers/profile.controller.js";
import { verifyJwt } from "./middlewares/verify-jwt.js";

export async function appRoutes(app: FastifyInstance) {
  app.post('/users', register);
  app.post('/sessions', authenticate);

  /** Authenticated */
  app.get('/me', { onRequest: [verifyJwt] }, profile)
}