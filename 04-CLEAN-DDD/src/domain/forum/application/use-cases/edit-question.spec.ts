import { EditQuestionUseCase } from './edit-question.js'
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository.js'
import { makeQuestion } from 'test/factories/make-question.js'
import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'

let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let sut: EditQuestionUseCase

describe('Edit Question', () => {
  beforeEach(() => {
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository()
    sut = new EditQuestionUseCase(inMemoryQuestionsRepository)
  })

  it('should be able to edit a question', async () => {
    const question = makeQuestion({
      authorId: new UniqueEntityID('author-1'),
    })
    await inMemoryQuestionsRepository.create(question)

    await sut.execute({
      authorId: 'author-1',
      questionId: question.id.toString(),
      title: 'Test Title',
      content: 'Test Content',
    })

    expect(inMemoryQuestionsRepository.items[0]).toMatchObject({
      title: 'Test Title',
      content: 'Test Content',
    })
  })

  it('should not be able to edit a question from another author', async () => {
    const question = makeQuestion({
      authorId: new UniqueEntityID('author-1'),
    })
    await inMemoryQuestionsRepository.create(question)

    await expect(() =>
      sut.execute({
        authorId: 'author-2',
        questionId: question.id.toString(),
        title: 'Test Title',
        content: 'Test Content',
      })
    ).rejects.toThrow('Not allowed')
  })

  it('should not be able to edit a non-existing question', async () => {
    await expect(() =>
      sut.execute({
        authorId: 'author-1',
        questionId: 'non-existing-id',
        title: 'Test Title',
        content: 'Test Content',
      })
    ).rejects.toThrow('Question not found')
  })
})
