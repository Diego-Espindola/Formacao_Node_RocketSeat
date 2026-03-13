import { OnAnswerCreated } from '@/domain/notification/application/subscribers/on-answer-created.js'
import { makeAnswer } from 'test/factories/make-answer.js'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository.js'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository.js'
import { vi } from 'vitest'

let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let inMemoryAnswersRepository: InMemoryAnswersRepository

describe('On Answer Created', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    )
  })

  it('should  send a notification when an answer is created', async () => {
    const _onAnswerCreated = new OnAnswerCreated()

    const answer = makeAnswer()
    const consoleLogSpy = vi.spyOn(console, 'log') 
    inMemoryAnswersRepository.create(answer)
    expect(consoleLogSpy).toHaveBeenCalledWith(answer);
  })
})