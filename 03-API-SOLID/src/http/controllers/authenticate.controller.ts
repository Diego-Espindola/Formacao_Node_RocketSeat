import { z } from 'zod'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { AuthenticateUseCase } from '../use-cases/authenticate.js';
import { PrismaUsersRepository } from '../repositories/prisma/prisma-users.repository.js';
import { InvalidCredentialsError } from '../use-cases/errors/invalid-credentials.error.js';
import { makeAuthenticateUseCase } from '../use-cases/factories/make-authenticate-use-case.factory.js';


export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const authenticateBodySchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
    });
    const authenticateUseCase = makeAuthenticateUseCase();
    const { email, password } = authenticateBodySchema.parse(request.body);

    try {
        await authenticateUseCase.execute({ email, password })
    } catch (err) {
        if (err instanceof InvalidCredentialsError) {
            return reply.status(400).send({ message: err.message });
        }

        throw err;
    }

    return reply.status(200).send();
}