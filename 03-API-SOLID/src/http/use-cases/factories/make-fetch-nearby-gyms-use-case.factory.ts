import { FetchNearbyGymsUseCase } from "../fetch-nearby-gyms.js"
import { PrismaGymsRepository } from "@/http/repositories/prisma/gyms.repository.js"

export function makeFetchNearbyGymsUseCase() {
  const gymsRepository = new PrismaGymsRepository()
  const fetchNearbyGymsUseCase = new FetchNearbyGymsUseCase(gymsRepository)

  return fetchNearbyGymsUseCase
}
