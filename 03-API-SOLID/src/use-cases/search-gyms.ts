import type { IGymsRepository } from '../repositories/gyms-repository.interface.js';
import type { Gym } from 'generated/prisma/index.js';


interface SearchGymsUseCaseRequest {
  query: string;
  page: number
}

interface SearchGymsUseCaseResponse {
  gyms: Gym[]
}


export class SearchGymsUseCase {
  constructor(
    private readonly repository: IGymsRepository
  ) { }
  async execute({
    query,
    page,
  }: SearchGymsUseCaseRequest): Promise<SearchGymsUseCaseResponse> {
    const gyms = await this.repository.searchMany(query, page);

    return {
      gyms
    }

  }
}