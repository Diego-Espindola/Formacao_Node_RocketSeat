import { PrismaCheckInsRepository } from "@/repositories/prisma/check-ins.repository.js"
import { FetchUserCheckInsHistoryUseCase } from "../fetch-user-check-ins-history.js"

export function makeFetchUserCheckInsHistoryUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository()
  const fetchUserCheckInsHistoryUseCase = new FetchUserCheckInsHistoryUseCase(checkInsRepository)

  return fetchUserCheckInsHistoryUseCase
}
