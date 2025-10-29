import { compare } from "bcryptjs";
import type { User } from "generated/prisma/index.js"
import type { IUsersRepository } from "../repositories/users-repository.interface.js";
import { InvalidCredentialsError } from "./errors/invalid-credentials.error.js";

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

interface AuthenticateUseCaseResponse {
  user: User
}

export class AuthenticateUseCase {
  constructor(
    private readonly usersRepository: IUsersRepository,
  ) { }

  async execute({ email, password }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {

    const user = await this.usersRepository.findUniqueUserByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const doesPasswordMatches = await compare(password, user.password_hash);
    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError();
    }

    return {
        user,
    }

  }

}