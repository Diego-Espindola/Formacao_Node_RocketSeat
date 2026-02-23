
import type { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository.js';
import { QuestionAttachment } from '@/domain/forum/enterprise/entities/question-attachment.js';

export class InMemoryQuestionAttachmentsRepository implements QuestionAttachmentsRepository  
{
  public items: QuestionAttachment[] = [];

  async findManyByQuestionId(questionId: string) {
    return this.items.filter(
      (item) => item.questionId.toString() === questionId
    );
  }
}