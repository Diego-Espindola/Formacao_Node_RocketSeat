import { type FastifyInstance } from "fastify"
import { verifyJwt } from '@/http/middlewares/verify-jwt.js'
import { search } from "./search.controller.js";
import { nearby } from "./nearby.controller.js";
import { create } from "./create.controller.js";

export async function gymsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt);

  app.get('/gyms/search', search);
  app.get('/gyms/nearby', nearby);

  app.post('/gyms', create);
}