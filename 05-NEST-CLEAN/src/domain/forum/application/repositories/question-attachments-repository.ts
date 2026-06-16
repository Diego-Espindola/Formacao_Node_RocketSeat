import { QuestionAttachment } from "../../enterprise/entities/question-attachment.js";

export abstract class QuestionAttachmentsRepository {
  abstract findManyByQuestionId(
    questionId: string,
  ): Promise<QuestionAttachment[]>

  abstract deleteManyByQuestionId(questionId: string): Promise<void>
}