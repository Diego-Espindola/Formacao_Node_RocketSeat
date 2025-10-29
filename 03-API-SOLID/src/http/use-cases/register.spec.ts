import { InMemoryUsersRepository } from '../repositories/in-memory/in-memory-users.repository.js'
import { UserAlreadyExistsError } from './errors/user-already-exists.error.js'
import { compare } from 'bcryptjs'
import { expect, describe, it, beforeEach } from 'vitest'
import { RegisterUseCase } from './register.usecase.js'

describe('Register Use Case', () => {
    let usersRepository: InMemoryUsersRepository;
    let registerUseCase: RegisterUseCase;
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository();
        registerUseCase = new RegisterUseCase(usersRepository);
    });
    it('should to register', async () => {
        const { user } = await registerUseCase.execute({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: '123456',
        })

        expect(user.id).toEqual(expect.any(String))
    })

    it('should hash user password upon registration', async () => {
        const { user } = await registerUseCase.execute({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: '123456',
        })

        const isPasswordCorrectlyHashed = await compare(
            '123456',
            user.password_hash,
        )

        expect(isPasswordCorrectlyHashed).toBe(true)
    })

    it('should not be able to register with same email twice', async () => {

        const email = 'johndoe@example.com'

        await registerUseCase.execute({
            name: 'John Doe',
            email,
            password: '123456',
        })

        await expect(() =>
            registerUseCase.execute({
                name: 'John Doe',
                email,
                password: '123456',
            }),
        ).rejects.toBeInstanceOf(UserAlreadyExistsError)
    })
})