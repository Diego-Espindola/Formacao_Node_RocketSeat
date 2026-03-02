import { AnswerAttachment } from '../../enterprise/entities/answer-attachment.js'
import { AnswerAttachmentList } from '../../enterprise/entities/answer-attachment-list.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Answer } from "@/domain/forum/enterprise/entities/answer.js"
import { type AnswersRepository } from "../repositories/answers-repository.js"
import { right, type Either } from "@/core/types/either.js"

interface AnswerQuestionUseCaseRequest {
  instructorId: string
  questionId: string
  attachmentsIds: string[]
  content: string
}

type AnswerQuestionUseCaseResponse = Either<
  null,
  {
    answer: Answer
  }
>

export class AnswerQuestionUseCase {
  constructor(
    private answersRepository: AnswersRepository,
  ) { }

  async execute({ instructorId, questionId, content, attachmentsIds }: AnswerQuestionUseCaseRequest):
    Promise<AnswerQuestionUseCaseResponse> {
    const answer = Answer.create({
      content,
      authorId: new UniqueEntityID(instructorId),
      questionId: new UniqueEntityID(questionId),
    })

    const answerAttachments = attachmentsIds.map((attachmentId) => {
      return AnswerAttachment.create({
        attachmentId: new UniqueEntityID(attachmentId),
        answerId: answer.id,
      })
    })

    answer.attachments = new AnswerAttachmentList(answerAttachments)

    await this.answersRepository.create(answer)

    return right({
      answer,
    })
  }
}