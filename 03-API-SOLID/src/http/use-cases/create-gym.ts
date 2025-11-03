import { hash } from 'bcryptjs'
import type { IGymsRepository } from '../repositories/gyms-repository.interface copy.js';
import { UserAlreadyExistsError } from './errors/user-already-exists.error.js';
import type { Gym } from 'generated/prisma/index.js';


interface CreateGymUseCaseRequest {
  title: string;
  description: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
}

interface CreateGymUseCaseResponse {
  gym: Gym
}


export class CreateGymUseCase {
  constructor(
    private readonly repository: IGymsRepository
  ) { }
  async execute({
    title,
    description,
    phone,
    latitude,
    longitude,
  }: CreateGymUseCaseRequest): Promise<CreateGymUseCaseResponse> {
    const gym = await this.repository.create({
      title,
      description,
      phone,
      latitude,
      longitude,
    });

    return {
      gym,
    }

  }
}