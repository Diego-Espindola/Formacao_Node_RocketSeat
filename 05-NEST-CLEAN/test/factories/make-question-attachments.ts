import { UniqueEntityID } from '@/core/entities/unique-entity-id.js';
import {
  QuestionAttachment,
  type QuestionAttachmentProps,
} from '@/domain/forum/enterprise/entities/question-attachment.js';

export function makeQuestionAttachment(
  override: Partial<QuestionAttachmentProps> = {},
  id?: UniqueEntityID
) {
  const defaultProps: QuestionAttachmentProps = {
    questionId: new UniqueEntityID(),
    attachmentId: new UniqueEntityID(),
    ...override,
  };

  return QuestionAttachment.create(defaultProps, id);
}