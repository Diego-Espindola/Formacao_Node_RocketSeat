import { PrismaUsersRepository } from "@/http/repositories/prisma/prisma-users.repository.js"
import { GetUserProfileUseCase } from "../get-user-profile.js"

export function makeGetUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const getUserProfileUseCase = new GetUserProfileUseCase(usersRepository)

  return getUserProfileUseCase
}
