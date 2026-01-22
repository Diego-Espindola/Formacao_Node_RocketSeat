import { type AnswersRepository } from '../repositories/answers-repository.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment.js'
import { type AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository.js'
import { left, right, type Either } from '@/core/types/either.js'
import { ResourceNotFoundError } from './errors/resource-not-found.error.js'

interface CommentOnAnswerUseCaseRequest {
  authorId: string
  answerId: string
  content: string
}

type CommentOnAnswerUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    answerComment: AnswerComment
  }
>
export class CommentOnAnswerUseCase {
  constructor(
    private answersRepository: AnswersRepository,
    private answerCommentsRepository: AnswerCommentsRepository,
  ) {}

  async execute({
    authorId,
    answerId,
    content,
  }: CommentOnAnswerUseCaseRequest): Promise<CommentOnAnswerUseCaseResponse> {
    const answer = await this.answersRepository.findById(answerId)

    if (!answer) {
      return left(new ResourceNotFoundError())
    }

    const answerComment = AnswerComment.create({
      authorId: new UniqueEntityID(authorId),
      answerId: new UniqueEntityID(answerId),
      content,
    })

    await this.answerCommentsRepository.create(answerComment)

    return right({
      answerComment,
    })
  }
}