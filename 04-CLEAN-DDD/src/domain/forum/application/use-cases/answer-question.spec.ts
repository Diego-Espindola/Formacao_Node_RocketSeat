import { expect, test } from "vitest"
import { AnswerQuestionUseCase } from "./answer-question.js"
import { type AnswersRepository } from "../repositories/answers-repository.js"
import { Answer } from "@/domain/forum/enterprise/entities/answer.js"

const fakeAnswersRepository: AnswersRepository = {
  create: async (answer: Answer) => {
    return;
  }
}

test('create an answer', async () => {
  const answerQuestion = new AnswerQuestionUseCase(fakeAnswersRepository)

  const answer = await answerQuestion.execute({
    questionId: '1',
    instructorId: '1',
    content: 'Nova resposta',
  })

  expect(answer.content).toEqual('Nova resposta')
})