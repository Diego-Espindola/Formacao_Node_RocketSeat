import { type Gym } from "generated/prisma/index.js";

export interface IGymsRepository {
  findById(id: string): Promise<Gym | null>
}