import { Entity } from "@/core/entities/entity.js"
import { UniqueEntityID } from "@/core/entities/unique-entity-id.js"

export interface StudentProps {
  name: string
  email: string
  password: string
}

export class Student extends Entity<StudentProps> {

  get name(): string {
    return this.props.name
  }

  get email(): string {
    return this.props.email
  }

  get password(): string {
    return this.props.password
  }

  static create(
    props: StudentProps,
    id?: UniqueEntityID,
  ) {
    const student = new Student(props, id)

    return student
  }
}