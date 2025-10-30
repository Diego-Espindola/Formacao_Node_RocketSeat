import type { Prisma, User } from "generated/prisma/index.js";

export interface IUsersRepository {
  findById(id: string): Promise<User | null>
  create(data: Prisma.UserCreateInput): Promise<User>;
  findUniqueUserByEmail(email: string): Promise<User | null>;
}