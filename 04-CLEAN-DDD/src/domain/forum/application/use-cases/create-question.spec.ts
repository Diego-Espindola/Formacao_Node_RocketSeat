import { expect, test } from "vitest"
import { CreateQuestionUseCase } from "./create-question.js"
import { type QuestionsRepository } from "../repositories/questions-repository.js"
import { Question } from "@/domain/forum/enterprise/entities/question.js"

const fakeAnswersRepository: QuestionsRepository = {
  create: async (answer: Question) => {
    return;
  }
}

test('create an question', async () => {
  const createQuestion = new CreateQuestionUseCase(fakeAnswersRepository)

  const { question } = await createQuestion.execute({
    authorId: '1',
    title: 'titulo',
    content: 'Conteudo da pergunta',
  })

  expect(question.id).toBeTruthy();
})