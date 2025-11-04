import { PrismaGymsRepository } from "@/http/repositories/prisma/gyms.repository.js"
import { CreateGymUseCase } from "../create-gym.js"

export function makeCreateGymUseCase() {
  const gymsRepository = new PrismaGymsRepository()
  const createGymUseCase = new CreateGymUseCase(gymsRepository)

  return createGymUseCase
}
