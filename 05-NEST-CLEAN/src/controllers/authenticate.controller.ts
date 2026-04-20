import { Controller, Post } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma/prisma.service'

@Controller('/sessions')
export class AuthenticateController {
  constructor(private jwt: JwtService) {}

  @Post()
  async handle() {
    const token = this.jwt.sign({ sub: 'user-id' })

    return token
  }
}