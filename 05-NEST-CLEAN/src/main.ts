import 'tsconfig-paths/register';
import { config } from 'dotenv';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

config({ path: resolve(process.cwd(), '.env') });

function resolvePort(): number {
  const parsed = Number(process.env.PORT);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  throw new Error('Invalid or missing PORT environment variable.');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(resolvePort());
}
bootstrap();
