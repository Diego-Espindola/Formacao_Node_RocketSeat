import { GetUserMetricsUseCase } from "../get-user-metrics.js"
import { PrismaCheckInsRepository } from "@/http/repositories/prisma/check-ins.repository.js"

export function makeGetUserMetricsUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository()
  const getUserMetricsUseCase = new GetUserMetricsUseCase(checkInsRepository)

  return getUserMetricsUseCase
}
