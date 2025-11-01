import type { IGymsRepository } from "../gyms-repository.interface copy.js";
import { type Gym } from "generated/prisma/index.js";

export class InMemoryGymsRepository implements IGymsRepository {
  public items: Gym[] = []

  async findById(id: string) {
    const gym = this.items.find((item) => item.id === id)

    if (!gym) {
      return null
    }

    return gym
  }
}