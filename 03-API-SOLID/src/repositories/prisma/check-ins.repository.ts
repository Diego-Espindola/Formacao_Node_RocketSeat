import { prisma } from '../../lib/prisma.js'
import { Prisma, type CheckIn } from 'generated/prisma/index.js';
import type { ICheckInsRepository } from '../check-ins-repository.interface.js';
import dayjs from 'dayjs';

export class PrismaCheckInsRepository implements ICheckInsRepository {
  public async findById(id: string) {
    const checkIn = await prisma.checkIn.findUnique({
      where: {
        id
      }
    });

    return checkIn;
  }
  public async create(data: Prisma.CheckInUncheckedCreateInput) {
    const checkIn = await prisma.checkIn.create({
      data
    });

    return checkIn;
  }
  public async findManyByUserId(userId: string, page: number) {
    const checkIns = await prisma.checkIn.findMany({
      where: {
        user_id: userId
      },
      take: 20,
      skip: (page - 1) * 20
    });

    return checkIns;
  }
  public async countByUserId(userId: string) {
    const count = await prisma.checkIn.count({
      where: {
        user_id: userId
      }
    });

    return count;
  }
  public async findByUserIdOnDate(userId: string, date: Date) {
    const startOfTheDay = dayjs(date).startOf('date');
    const endOfTheDay = dayjs(date).endOf('date');

    const checkIn = await prisma.checkIn.findFirst({
      where: {
        user_id: userId,
        created_at: {
          gte: startOfTheDay.toDate(),
          lte: endOfTheDay.toDate(),
        }
      }
    });

    return checkIn;
  }
  public async save(data: CheckIn) {
    const checkIn = await prisma.checkIn.update({
      where: {
        id: data.id,
      },
      data
    });

    return checkIn;

  }

}