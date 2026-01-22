import { right, type Either } from "@/core/types/either.js";
import { Question } from "../../enterprise/entities/question.js";
import type { QuestionsRepository } from "../repositories/questions-repository.js"
import { UniqueEntityID } from "@/core/entities/unique-entity-id.js";

interface CreateQuestionUseCaseRequest {
  authorId: string;
  title: string;
  content: string;
}

type CreateQuestionUseCaseResponse = Either<
  null,
  {
    question: Question
  }
>

export class CreateQuestionUseCase {
  constructor(
    private questionsRepository: QuestionsRepository,
  ) { }

  async execute({
    authorId,
    title,
    content
  }: CreateQuestionUseCaseRequest): Promise<CreateQuestionUseCaseResponse> {


    const question = Question.create({
      authorId: new UniqueEntityID(authorId),
      title,
      content,
    });

    await this.questionsRepository.create(question)

    return right({
      question,
    })
  }
}