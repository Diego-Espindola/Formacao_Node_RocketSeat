# Gym Project

Frontend Angular 18 + backend Express + Prisma/PostgreSQL para rastreamento de treinos.

## Estrutura

```
06-GYM-PROJECT/
├── Makefile
├── docker-compose.yml
├── data/
│   └── seed.json           # dados versionados no Git
├── nginx/
│   └── default.conf
├── gym-backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── prisma.config.js    # DATABASE_URL para CLI (Prisma 7)
│   ├── .env.example
│   └── scripts/
│       ├── export-seed.js
│       └── import-seed.js
└── gym-frontend/
```

## Como rodar (Docker)

```bash
cd 06-GYM-PROJECT
make start
```

Abre em **http://localhost:47831**. Login: use um **e-mail cadastrado** em `data/seed.json` (a senha é obrigatória no formulário, mas ainda não é validada no banco).

### Portas e rede

| Serviço  | Porta | Visível no host? | Acesso |
|----------|-------|------------------|--------|
| nginx    | **47831** | Sim | entrada única — use esta |
| backend  | 3377 | Não (`expose`) | via nginx em `/api/` |
| frontend | 3378 | Não (`expose`) | via nginx em `/` |
| postgres | 5432 | Não | só rede interna Docker |

`lsof -i :3377` e `lsof -i :3378` **não retornam nada no host** — isso é normal. Para verificar:

```bash
make ps
lsof -i :47831
curl http://localhost:47831/api/health
```

### O que acontece no `make start`

1. `git pull` — traz o `data/seed.json` mais recente do repositório
2. `docker compose up --build -d` — sobe postgres, backend, frontend e nginx
3. No backend (entrypoint):
   - `prisma generate` — gera o client em `generated/prisma/`
   - `prisma migrate deploy` — aplica migrations pendentes
   - `import-seed.js` — importa `data/seed.json` **somente se o banco estiver vazio**

Se o banco **já tem dados**, o import é ignorado (`Banco já tem dados — import ignorado`).

## Comandos do `make`

| Comando | O que faz |
|---------|-----------|
| `make help` | Lista os comandos |
| `make start` | `git pull` + sobe Docker (generate + migrate + seed se vazio) |
| `make stop` | Para containers (`docker compose down`) — **não exporta seed** |
| `make save MSG="..."` | Exporta banco → `data/seed.json` → commit + push |
| `make export` | Só exporta Postgres → `data/seed.json` |
| `make import` | Importa seed **só se banco vazio** |
| `make reset` | Apaga banco, reaplica migrations e reimporta seed |
| `make logs` | Logs em tempo real |
| `make ps` | Status dos containers |

### Fluxo diário (2 devs)

```bash
make start                              # pull + sobe stack
# usa o app em http://localhost:47831 ...
make save MSG="cadastrei treino de peito"  # export + commit + push
make stop                               # para (dados ficam no volume Docker)
```

### Regras importantes

- **`make start` não sobrescreve** dados locais se o banco já tiver exercícios
- **`make stop` não salva no Git** — só para os containers; o Postgres persiste no volume `postgres_data`
- **`make save` é o comando para versionar** alterações do banco no Git
- `git pull` antes de iniciar (`make start` já faz)
- Não rode em duas máquinas ao mesmo tempo
- Após **migration**, use o app e rode `make save` (commit schema + seed juntos)

### Quando usar cada comando

| Situação | Comando |
|----------|---------|
| Começar o dia / pegar dados do colega | `make start` |
| Terminar e salvar alterações no Git | `make save MSG="..."` |
| Parar sem salvar no Git | `make stop` |
| Forçar recarregar o `seed.json` do Git | `make reset` |
| Só exportar sem commit | `make export` |
| Máquina nova com Postgres vazio | `make start` (import automático) |

## Banco de dados

- **PostgreSQL roda só dentro do Docker** (container `postgres`)
- Credenciais: `gym` / `gym`, database `gym`
- Dados persistem no volume Docker `postgres_data` (sobrevive a `make stop`)
- Para **apagar tudo** incluindo o volume: `docker compose down -v`

O backend recebe `DATABASE_URL` e `SEED_PATH` via `docker-compose.yml` — não depende do `.env` local dentro do container.

## Dados + Git (`seed.json`)

Os dados ficam em `data/seed.json` e são versionados no Git.

**`muscle_groups`** (Peito, Costas, etc.) são dados de referência fixos — ficam na **migration**, não no seed. O seed traz users, exercises e workouts (blocos, exercícios e séries).

```
Git (seed.json) ──git pull──► disco ──import (se vazio)──► Postgres
Postgres ──export──► seed.json ──git push──► Git
Migration ──migrate deploy──► muscle_groups (referência fixa)
```

- **`make start`**: puxa seed do Git; importa apenas em banco vazio
- **`make save`**: exporta estado atual do banco e envia ao Git
- **`make reset`**: zera o banco e reimporta o `seed.json` local (funciona mesmo com backend parado)

## Setup local (fora do Docker)

Para rodar Prisma CLI no host (`gym-backend/`):

```bash
cp .env.example .env
npm install
```

O `.env.example` usa `localhost:5432`, mas o Postgres **não expõe porta no host** por padrão. Para dev local fora do Docker, adicione no `docker-compose.yml`:

```yaml
postgres:
  ports:
    - '5432:5432'
```

## Prisma 7

- **`schema.prisma`** — models e provider (`prisma-client-js` gera `.js` para Node puro)
- **`prisma.config.js`** — `DATABASE_URL` para CLI (migrate, generate)
- **`src/lib/prisma.js`** — `PrismaClient` + adapter `@prisma/adapter-pg`
- **`generated/prisma/`** — client gerado (gitignored; recriado no build e entrypoint)

### Migrations

Criar migration (com stack rodando):

```bash
docker compose exec backend npx prisma migrate dev --name descricao
```

Depois de alterar schema: subir app, testar, `make save` (commit migration + seed.json).

## Troubleshooting

### Backend não sobe / `make reset` falha

```bash
make logs
docker compose logs backend --tail 50
```

Causas comuns:
- **Prisma Client ausente** — o entrypoint roda `prisma generate`; se falhar, recrie: `make stop && make start`
- **Bind mount** — `./gym-backend:/app` monta o código do host; volumes anônimos protegem `node_modules` e `generated/`

### Porta 47831 ocupada

Desative nginx do host (`gym-tunnel`, `front.conf`, `api.conf`) se existir em `/etc/nginx/sites-enabled/`.

### Permissão Docker

```bash
sudo usermod -aG docker $USER
newgrp docker
```

O Makefile usa `sudo docker compose` se necessário.

## Endpoints da API

| Método | Rota |
|--------|------|
| POST | `/sessions` |
| GET/POST | `/exercises` |
| GET/PUT/DELETE | `/exercises/:id` |
| GET | `/muscle-groups` |
| GET/POST | `/workouts` |
| GET/PUT/DELETE | `/workouts/:id` |

Filtro opcional em `GET /workouts`: `?is_template=true` ou `?is_template=false`.

O frontend chama `/api/...`; o nginx repassa para o backend removendo o prefixo `/api`.
