import dayjs from 'dayjs'
import { type ICheckInsRepository } from '../repositories/check-ins-repository.interface.js'
import { ResourceNotFoundError } from './errors/resource-not-found-error.js'
import { type CheckIn } from 'generated/prisma/index.js'
import { LateCheckInValidationError } from './errors/late-check-in-validation-error.js'

interface ValidateCheckInUseCaseRequest {
  checkInId: string
}

interface ValidateCheckInUseCaseResponse {
  checkIn: CheckIn
}

export class ValidateCheckInUseCase {
  constructor(private checkInsRepository: ICheckInsRepository) {}

  async execute({
    checkInId,
  }: ValidateCheckInUseCaseRequest): Promise<ValidateCheckInUseCaseResponse> {
    const checkIn = await this.checkInsRepository.findById(checkInId)

    if (!checkIn) {
      throw new ResourceNotFoundError()
    }

    const distanceInMinutesFromCheckInCreation = dayjs(new Date()).diff(
      checkIn.created_at,
      'minutes',
    );

    const MAX_TIME_MINUTES_DISTANCE = 20;
    if(distanceInMinutesFromCheckInCreation > MAX_TIME_MINUTES_DISTANCE){
      throw new LateCheckInValidationError();
    }

    checkIn.validated_at = new Date()

    await this.checkInsRepository.save(checkIn)

    return {
      checkIn,
    }
  }
}