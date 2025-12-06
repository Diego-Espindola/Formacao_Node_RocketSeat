import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment.js'

export interface AnswerCommentsRepository {
  create(answerComment: AnswerComment): Promise<void>
}