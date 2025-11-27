import { Question } from "../../enterprise/entities/question.js";

export interface QuestionsRepository {
  findById(id: string): Promise<Question | null>
  findBySlug(slug: string): Promise<Question | null>
  save(question: Question): Promise<void>
  create(answer: Question): Promise<void>
  delete(question: Question): Promise<void>
}