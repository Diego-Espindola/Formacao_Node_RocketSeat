import { prisma } from '../../lib/prisma.js'
import { Prisma } from '@prisma/client';
import type { IUsersRepository } from '../users-repository.interface.js';


export class PrismaUsersRepository implements IUsersRepository {
  public async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })

    return user
  }
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