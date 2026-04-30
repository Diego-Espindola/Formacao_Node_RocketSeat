import type { PaginationParams } from "@/core/repositories/pagination-params.js";
import { Question } from "../../enterprise/entities/question.js";

export abstract class QuestionsRepository {
  abstract findById(id: string): Promise<Question | null>
  abstract findBySlug(slug: string): Promise<Question | null>
  abstract findManyRecent(params: PaginationParams): Promise<Question[]>
  abstract save(question: Question): Promise<void>
  abstract create(answer: Question): Promise<void>
  abstract delete(question: Question): Promise<void>
}