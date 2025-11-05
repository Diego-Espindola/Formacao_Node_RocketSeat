import { SearchGymsUseCase } from "../search-gyms.js"
import { PrismaGymsRepository } from "@/repositories/prisma/gyms.repository.js"

export function makeSearchGymsUseCase() {
  const gymsRepository = new PrismaGymsRepository()
  const searchGymsUseCase = new SearchGymsUseCase(gymsRepository)

  return searchGymsUseCase
}
