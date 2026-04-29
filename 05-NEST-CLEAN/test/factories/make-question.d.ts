import { UniqueEntityID } from '@/core/entities/unique-entity-id.js';
import { Question, type QuestionProps } from '@/domain/forum/enterprise/entities/question.js';
export declare function makeQuestion(override?: Partial<QuestionProps>, id?: UniqueEntityID): Question;
