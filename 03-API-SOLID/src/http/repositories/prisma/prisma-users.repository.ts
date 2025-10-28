import { prisma } from '../../../lib/prisma.js'
import { Prisma } from 'generated/prisma/index.js';
import type { IUsersRepository } from '../users-repository.interface.js';


export class PrismaUsersRepository implements IUsersRepository{
    public async create(data: Prisma.UserCreateInput) {
        const user = await prisma.user.create({ data });

        return user;
    }

    public async findUniqueUserByEmail(email: string) {
        return await prisma.user.findUnique({
            where: {
                email,
            }
        });
    }
}