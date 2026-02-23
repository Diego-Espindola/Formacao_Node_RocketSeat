import { QuestionAttachment } from "../../enterprise/entities/question-attachment.js";

export interface QuestionAttachmentsRepository {
  findManyByQuestionId(questionId: string): Promise<QuestionAttachment[]>
}
