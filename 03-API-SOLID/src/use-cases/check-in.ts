import { type ICheckInsRepository } from "../repositories/check-ins-repository.interface.js"
import { type CheckIn } from 'generated/prisma/index.js'
import type { IGymsRepository } from "../repositories/gyms-repository.interface.js"
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js"
import { getDistanceBetweenCoordinates } from "../utils/get-distance-between-coordinates.js"
import { MaxDistanceError } from "./errors/max-distance-error.js"
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ins-error.js"

interface CheckInUseCaseRequest {
  userId: string
  gymId: string
  userLatitude: number
  userLongitude: number
}

interface CheckInUseCaseResponse {
  checkIn: CheckIn
}

export class CheckInUseCase {
  constructor(
    private checkInsRepository: ICheckInsRepository,
    private gymsRepository: IGymsRepository,
  ) { }

  async execute({
    userId,
    gymId,
    userLatitude,
    userLongitude,
  }: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse> {
    const gym = await this.gymsRepository.findById(gymId)

    if (!gym) {
      throw new ResourceNotFoundError()
    }

    const distanceKm = getDistanceBetweenCoordinates(
      {latitude: userLatitude, longitude: userLongitude},
      {latitude: gym.latitude.toNumber(), longitude: gym.longitude.toNumber()}
    )

    const MAX_DISTANCE_IN_KILOMETERS = 0.1
    if(distanceKm > MAX_DISTANCE_IN_KILOMETERS){
      throw new MaxDistanceError();
    }

    const checkInOnSameDay = await this.checkInsRepository.findByUserIdOnDate(
      userId,
      new Date(),
    )

    if (checkInOnSameDay) {
      throw new MaxNumberOfCheckInsError();
    }

    const checkIn = await this.checkInsRepository.create({
      gym_id: gymId,
      user_id: userId,
    })

    return {
      checkIn,
    }
  }
}