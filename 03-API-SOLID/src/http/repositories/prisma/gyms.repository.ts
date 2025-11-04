import { prisma } from '../../../lib/prisma.js'
import { Prisma, type Gym } from 'generated/prisma/index.js';
import type { FindManyNearbyParams, IGymsRepository } from '../gyms-repository.interface.js';

export class PrismaUsersRepository implements IGymsRepository {
  findById(id: string): Promise<Gym | null> {
    throw new Error('Method not implemented.');
  }
  findManyNearby(params: FindManyNearbyParams): Promise<Gym[]> {
    throw new Error('Method not implemented.');
  }
  searchMany(query: string, page: number): Promise<Gym[]> {
    throw new Error('Method not implemented.');
  }
  create(data: Prisma.GymCreateInput): Promise<Gym> {
    throw new Error('Method not implemented.');
  }

}