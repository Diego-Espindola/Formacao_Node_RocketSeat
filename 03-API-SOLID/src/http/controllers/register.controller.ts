import { z } from 'zod'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { RegisterUseCase } from '../use-cases/register.usecase.js';
import { PrismaUsersRepository } from '../repositories/prisma/prisma-users.repository.js';
import { UserAlreadyExistsError } from '../use-cases/errors/user-already-exists.error.js';


export async function register(request: FastifyRequest, reply: FastifyReply) {
    const registerBodySchema = z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
    });
    const registerUseCase = new RegisterUseCase(new PrismaUsersRepository());
    const { name, email, password } = registerBodySchema.parse(request.body);

    try {
        await registerUseCase.execute({ name, email, password })
    } catch (err) {
        if (err instanceof UserAlreadyExistsError) {
            return reply.status(409).send({ message: err.message });
        }

        throw err;
    }

    return reply.status(201).send();
}