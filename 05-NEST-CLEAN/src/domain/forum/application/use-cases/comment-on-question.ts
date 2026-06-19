import { QuestionsRepository } from '../repositories/questions-repository.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { QuestionComment } from '@/domain/forum/enterprise/entities/question-comment.js'
import { QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository.js'
import { left, right, type Either } from '@/core/types/either.js'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found.error.js'
import { Injectable } from '@nestjs/common'

interface CommentOnQuestionUseCaseRequest {
  authorId: string
  questionId: string
  content: string
}

type CommentOnQuestionUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    questionComment: QuestionComment
  }
>

@Injectable()
export class CommentOnQuestionUseCase {
  constructor(
    private questionsRepository: QuestionsRepository,
    private questionCommentsRepository: QuestionCommentsRepository,
  ) {}

  async execute({
    authorId,
    questionId,
    content,
  }: CommentOnQuestionUseCaseRequest): Promise<CommentOnQuestionUseCaseResponse> {
    const question = await this.questionsRepository.findById(questionId)

    if (!question) {
      return left(new ResourceNotFoundError())
    }

    const questionComment = QuestionComment.create({
      authorId: new UniqueEntityID(authorId),
      questionId: new UniqueEntityID(questionId),
      content,
    })

    await this.questionCommentsRepository.create(questionComment)

    return right({
      questionComment,
    })
  }
}