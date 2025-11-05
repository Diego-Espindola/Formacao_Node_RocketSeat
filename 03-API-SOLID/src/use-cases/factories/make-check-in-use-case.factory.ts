import { PrismaCheckInsRepository } from "@/repositories/prisma/check-ins.repository.js"
import { CheckInUseCase } from "../check-in.js"
import { PrismaGymsRepository } from "@/repositories/prisma/gyms.repository.js"

export function makeCheckInUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository()
  const gymsRepository = new PrismaGymsRepository()
  const checkInUseCase = new CheckInUseCase(checkInsRepository, gymsRepository)

  return checkInUseCase
}
