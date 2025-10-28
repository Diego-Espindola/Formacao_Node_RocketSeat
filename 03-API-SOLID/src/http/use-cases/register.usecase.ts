import { hash } from 'bcryptjs'
import type { IUsersRepository } from '../repositories/users-repository.interface.js';
import { UserAlreadyExistsError } from './errors/user-already-exists.error.js';


interface RegisterUseCaseRequest {
    name: string;
    email: string;
    password: string;
}

export class RegisterUseCase {
    constructor(
        private readonly repository: IUsersRepository
    ) { }
    async execute({ name, email, password }: RegisterUseCaseRequest) {
        const password_hash = await hash(password, 6);

        const userWithSameEmail = await this.repository.findUniqueUserByEmail(email);

        if (userWithSameEmail) {
            throw new UserAlreadyExistsError();
        }

        await this.repository.create({
            name,
            email,
            password_hash
        })

    }
}