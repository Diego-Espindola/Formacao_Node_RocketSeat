import { QuestionComment } from "../../enterprise/entities/question-comment.js";

export interface QuestionCommentsRepository {
  create(questionComment: QuestionComment): Promise<void>
}
