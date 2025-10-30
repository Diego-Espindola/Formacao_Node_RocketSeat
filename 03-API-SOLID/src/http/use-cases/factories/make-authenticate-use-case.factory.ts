import { PrismaUsersRepository } from "@/http/repositories/prisma/prisma-users.repository.js"
import { AuthenticateUseCase } from "../authenticate.js"

export function makeAuthenticateUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const authenticateUseCase = new AuthenticateUseCase(usersRepository)

  return authenticateUseCase
}