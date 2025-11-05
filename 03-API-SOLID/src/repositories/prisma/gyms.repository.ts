import { prisma } from '../../lib/prisma.js'
import { Prisma, type Gym } from '@prisma/client';
import type { FindManyNearbyParams, IGymsRepository } from '../gyms-repository.interface.js';
import { getDistanceBetweenCoordinates } from '@/utils/get-distance-between-coordinates.js';

export class PrismaGymsRepository implements IGymsRepository {
  public async findById(id: string) {
    const gym = await prisma.gym.findUnique({
      where: {
        id
      }
    });

    return gym;
  }

  public async findManyNearby(params: FindManyNearbyParams) {
    const RADIUS_IN_DEGREES = 0.001; // ~111m de latitude
    const gyms = await prisma.gym.findMany({
      where: {
        latitude: {
          gte: params.latitude - RADIUS_IN_DEGREES,
          lte: params.latitude + RADIUS_IN_DEGREES,
        },
        longitude: {
          gte: params.longitude - RADIUS_IN_DEGREES,
          lte: params.longitude + RADIUS_IN_DEGREES,
        },
      },
    });

    const LIMIT_METERS_TO_NEARBY = 10;
    const nearbyGyms = gyms.filter(gym =>
      getDistanceBetweenCoordinates(
        { latitude: params.latitude, longitude: params.longitude },
        { latitude: gym.latitude.toNumber(), longitude: gym.longitude.toNumber() }
      ) <= LIMIT_METERS_TO_NEARBY
    );

    return nearbyGyms;
  }

  public async searchMany(query: string, page: number) {
    const gyms = await prisma.gym.findMany({
      where: {
        OR: [
          {
            description: {
              contains: query
            }
          },
          {
            title: {
              contains: query
            }
          }
        ]
      },
      take: 20,
      skip: (page - 1) * 20
    });

    return gyms;
  }

  public async create(data: Prisma.GymCreateInput) {
    return await prisma.gym.create({
      data
    })
  }

}