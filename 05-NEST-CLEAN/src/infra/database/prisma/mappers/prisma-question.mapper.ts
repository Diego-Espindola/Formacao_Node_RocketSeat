import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Question } from "@/domain/forum/enterprise/entities/question";
import { Slug } from "@/domain/forum/enterprise/entities/value-objects/slug";
import { Question as PrismaQuestion } from "prisma/generated/prisma/client.js";

export class PrismaQuestionMapper {
  static toDomain(raw: PrismaQuestion): Question {
    return Question.create({
      authorId: new UniqueEntityID(raw.authorId),
      title: raw.title,
      content: raw.content,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      slug: Slug.create(raw.slug),
      bestAnswerId: undefined,
    }, new UniqueEntityID(raw.id));
  }
}