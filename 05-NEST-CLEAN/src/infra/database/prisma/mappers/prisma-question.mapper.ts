import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Question } from "@/domain/forum/enterprise/entities/question";
import { Slug } from "@/domain/forum/enterprise/entities/value-objects/slug";
import { Prisma, Question as PrismaQuestion } from "prisma/generated/prisma/client.js";

export class PrismaQuestionMapper {
  static toDomain(raw: PrismaQuestion): Question {
    return Question.create({
      authorId: new UniqueEntityID(raw.authorId),
      title: raw.title,
      content: raw.content,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      slug: Slug.create(raw.slug),
      bestAnswerId: raw.bestAnswerId ? new UniqueEntityID(raw.bestAnswerId) : null,
    }, new UniqueEntityID(raw.id));
  }

  static toPrisma(question: Question): Prisma.QuestionUncheckedCreateInput {
    return {
      id: question.id.toString(),
      authorId: question.authorId.toString(),
      bestAnswerId: question.bestAnswerId?.toString(),
      title: question.title,
      content: question.content,
      slug: question.slug.value,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    }
  }
}