import { hash } from 'bcryptjs'
import type { IUsersRepository } from '../repositories/users-repository.interface.js';
import { UserAlreadyExistsError } from './errors/user-already-exists.error.js';
import type { User } from '@prisma/client';


interface RegisterUseCaseRequest {
    name: string;
    email: string;
    password: string;
}

interface RegisterUseCaseResponse {
    user: User
}


export class RegisterUseCase {
    constructor(
        private readonly repository: IUsersRepository
    ) { }
    async execute({ name, email, password }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
        const password_hash = await hash(password, 6);

        const userWithSameEmail = await this.repository.findUniqueUserByEmail(email);

        if (userWithSameEmail) {
            throw new UserAlreadyExistsError();
        }

        const user = await this.repository.create({
            name,
            email,
            password_hash
        });

        return {
            user,
        }

    }
}