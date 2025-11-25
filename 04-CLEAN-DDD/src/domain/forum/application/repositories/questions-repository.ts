import { Question } from "../../enterprise/entities/question.js";

export interface QuestionsRepository {
  create(answer: Question): Promise<void>
}