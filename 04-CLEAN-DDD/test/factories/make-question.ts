import { UniqueEntityID } from '@/core/entities/unique-entity-id.js'
import {
  Question,
  type QuestionProps,
} from '@/domain/forum/enterprise/entities/question.js'

export function makeQuestion(override: Partial<QuestionProps> = {}) {
  const question = Question.create({
    authorId: new UniqueEntityID(),
    title: 'Example',
    content: 'Example content',
    ...override,
  })

  return question
}