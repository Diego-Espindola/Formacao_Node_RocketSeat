import { Entity } from "@/core/entities/entity.js"
import { UniqueEntityID } from "@/core/entities/unique-entity-id.js"

interface InstructorProps {
  name: string
}

export class Instructor extends Entity<InstructorProps> {
  static create(
    props: InstructorProps,
    id?: UniqueEntityID,
  ) {
    const instructor = new Instructor(props, id)

    return instructor
  }
}