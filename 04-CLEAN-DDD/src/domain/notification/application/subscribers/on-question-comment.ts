import { DomainEvents } from '@/core/events/domain-events.js'
import { type EventHandler } from '@/core/events/event-handler.js'
import { type QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository.js'
import { CommentOnQuestionEvent } from '@/domain/forum/enterprise/events/comment-on-question-event.js'
import { SendNotificationUseCase } from '@/domain/notification/application/use-cases/send-notification.js'

export class OnQuestionComment implements EventHandler {
  constructor(
    private questionsRepository: QuestionsRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendCommentOnQuestionNotification.bind(this),
      CommentOnQuestionEvent.name,
    )
  }

  private async sendCommentOnQuestionNotification({
    questionComment
  }: CommentOnQuestionEvent) {
    const question = await this.questionsRepository.findById(
        questionComment.questionId.toString(),
    )

    if (question) {
      await this.sendNotification.execute({
        recipientId: questionComment.authorId.toString(),
        title: `Sua pergunta teve um comentário!`,
        content: `A pergunta que você enviou em "${question.title
          .substring(0, 20)
          .concat('...')}" recebeu um comentário!"`,
      })
    }
  }
}