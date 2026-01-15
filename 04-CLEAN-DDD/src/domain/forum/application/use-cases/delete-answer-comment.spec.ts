import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository.js'
import { DeleteAnswerCommentUseCase } from './delete-answer-comment.js'
import { makeAnswerComment } from 'test/factories/make-answer-comment.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import { Left } from '@/core/types/either.js'

let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository
let sut: DeleteAnswerCommentUseCase

describe('Delete Answer Comment', () => {
  beforeEach(() => {
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository()

    sut = new DeleteAnswerCommentUseCase(inMemoryAnswerCommentsRepository)
  })

  it('should be able to delete a answer comment', async () => {
    const answerComment = makeAnswerComment()

    await inMemoryAnswerCommentsRepository.create(answerComment)

    await sut.execute({
      answerCommentId: answerComment.id.toString(),
      authorId: answerComment.authorId.toString(),
    })

    expect(inMemoryAnswerCommentsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete another user answer comment', async () => {
    const answerComment = makeAnswerComment({
      authorId: new UniqueEntityID('author-1'),
    })

    await inMemoryAnswerCommentsRepository.create(answerComment)

    const sutResponse = await sut.execute({
      answerCommentId: answerComment.id.toString(),
      authorId: 'author-2',
    });
    expect(sutResponse).toBeInstanceOf(Left);
  });
});