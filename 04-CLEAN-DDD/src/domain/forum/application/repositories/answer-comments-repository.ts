import type { PaginationParams } from '@/core/repositories/pagination-params.js'
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment.js'

export interface AnswerCommentsRepository {
  findById(id: string): Promise<AnswerComment | null>
  findManyByAnswerId(
    answerId: string,
    params: PaginationParams,
  ): Promise<AnswerComment[]>
  create(answerComment: AnswerComment): Promise<void>
  delete(answerComment: AnswerComment): Promise<void>
}