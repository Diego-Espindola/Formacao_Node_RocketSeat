import { type CheckIn, Prisma } from "generated/prisma/index.js";

export interface ICheckInsRepository {
  create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn>
}