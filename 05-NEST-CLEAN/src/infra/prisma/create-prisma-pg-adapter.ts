import { PrismaPg } from '@prisma/adapter-pg'

export function createPrismaPgAdapter(databaseUrl: string): PrismaPg {
  const url = new URL(databaseUrl)
  const schema = url.searchParams.get('schema') ?? 'public'
  return new PrismaPg(databaseUrl, { schema })
}
