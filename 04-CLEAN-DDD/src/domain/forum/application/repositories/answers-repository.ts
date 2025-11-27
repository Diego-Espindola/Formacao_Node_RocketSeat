import { Answer } from "../../enterprise/entities/answer.js";

export interface AnswersRepository {
  findById(id: string): Promise<Answer | null>
  create(answer: Answer): Promise<void>
  save(answer: Answer): Promise<void>
  delete(answer: Answer): Promise<void>
}