import path from 'node:path';
import { register } from 'tsconfig-paths';

/**
 * Em runtime o código está em `dist/`. O `tsconfig-paths/register` lê o tsconfig e
 * mapeia `@/*` → `./src/*`, que não existe como `.js` ao correr `node dist/...`.
 * O `nest start --watch` também não corre `tsc-alias` após cada compilação.
 */
register({
  baseUrl: path.resolve(__dirname, '..'),
  paths: {
    '@/*': ['./*'],
  },
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Env } from './env/env';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false
  });

  const configService = app.get<ConfigService<Env, true>>(ConfigService)
  const port = configService.get('PORT', { infer: true })
  await app.listen(port);
}
bootstrap();
