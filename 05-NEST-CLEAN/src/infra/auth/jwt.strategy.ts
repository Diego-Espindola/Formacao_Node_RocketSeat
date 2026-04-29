import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Env } from "@/infra/env";
import z from "zod";

const tokenPayloadSchema = z.object({
  sub: z.string(),
})

export type UserTokenPayload = z.infer<typeof tokenPayloadSchema>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Env, true>) {
    const publicKeyB64 = config.get('JWT_PUBLIC_KEY', { infer: true })
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