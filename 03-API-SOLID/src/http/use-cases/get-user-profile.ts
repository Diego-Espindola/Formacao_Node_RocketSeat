import { InMemoryUsersRepository } from '../repositories/in-memory/in-memory-users.repository.js'
import type { User } from 'generated/prisma/index.js'
import { ResourceNotFoundError } from './errors/resource-not-found-error.js'

interface GetUserProfileUseCaseRequest {
  userId: string
}

interface GetUserProfileUseCaseResponse {
  user: User
}

export class GetUserProfileUseCase {
  constructor(private usersRepository: InMemoryUsersRepository) {}

  async execute({
    userId,
  }: GetUserProfileUseCaseRequest): Promise<GetUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    return {
      user,
    }
  }
}