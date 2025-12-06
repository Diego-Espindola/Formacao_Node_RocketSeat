import { type QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository.js'
import { QuestionComment } from '@/domain/forum/enterprise/entities/question-comment.js'

export class InMemoryQuestionCommentsRepository
  implements QuestionCommentsRepository
{
  public items: QuestionComment[] = []

  async create(questionComment: QuestionComment) {
    this.items.push(questionComment)
  }
}