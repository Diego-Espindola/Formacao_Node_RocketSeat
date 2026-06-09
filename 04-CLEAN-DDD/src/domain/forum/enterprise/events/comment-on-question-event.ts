import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { type DomainEvent } from '@/core/events/domain-event.js'
import { QuestionComment } from '../entities/question-comment.js'

export class CommentOnQuestionEvent implements DomainEvent {
  public ocurredAt: Date
  public questionComment: QuestionComment

  constructor(questionComment: QuestionComment) {
    this.questionComment = questionComment
    this.ocurredAt = new Date()
  }

  getAggregateId(): UniqueEntityID {
    return this.questionComment.id
  }
}