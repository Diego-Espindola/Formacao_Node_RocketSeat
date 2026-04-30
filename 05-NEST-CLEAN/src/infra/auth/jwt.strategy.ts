import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import z from "zod";
import { EnvService } from "../env/env.service";

const tokenPayloadSchema = z.object({
  sub: z.string(),
})

export type UserTokenPayload = z.infer<typeof tokenPayloadSchema>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private envService: EnvService) {
    const publicKeyB64 = envService.get('JWT_PUBLIC_KEY')
    const publicKey = Buffer.from(publicKeyB64, 'base64')
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    })
  }

  async validate(payload: UserTokenPayload) {
    return tokenPayloadSchema.parse(payload)
  }
}