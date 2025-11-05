import { ValidateCheckInUseCase } from "../validate-check-in.js"
import { PrismaCheckInsRepository } from "@/repositories/prisma/check-ins.repository.js"

export function makeValidateCheckInUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository()
  const validateCheckInUseCase = new ValidateCheckInUseCase(checkInsRepository)

  return validateCheckInUseCase
}
