# Gym Project

Frontend Angular 18 + backend Express para rastreamento de treinos.

## Estrutura

```
06-GYM-PROJECT/
├── Makefile
├── docker-compose.yml
├── data/
│   └── gym.db              # SQLite versionado no Git
├── nginx/
│   └── default.conf        # gateway /api + frontend
├── gym-backend/
└── gym-frontend/
    └── src/app/
        ├── core/           # Interceptors, guards, API base
        ├── models/         # Interfaces TypeScript das entidades
        ├── services/       # CRUD com Signals
        └── features/       # Telas (auth, exercícios, treinos)
```

## Como rodar (Docker)

Requisitos: Docker e Docker Compose instalados.

O `Makefile` usa `docker compose` automaticamente. Se seu usuário não tiver permissão no Docker, ele cai para `sudo docker compose` (vai pedir senha).

```bash
cd 06-GYM-PROJECT
make start      # sobe em background (-d)
make logs       # ver logs (opcional)
```

Abre em **http://localhost:47831**. Login: **qualquer e-mail/senha**.

O `make start` usa `docker compose up -d` — os containers **continuam rodando** depois que o comando termina (necessário para dev tunnel / port forward).

Confirme que está no ar:

```bash
make ps
curl -I http://127.0.0.1:47831/
```

`lsof -i :47831` pode não mostrar nada (processo `docker-proxy`). Use `make ps` ou `ss -tln | grep 47831`.

### Permissão do Docker (fix permanente)

Se quiser rodar sem sudo:

```bash
sudo usermod -aG docker $USER
newgrp docker          # ou faça logout/login
docker ps              # deve funcionar sem sudo
```

Depois disso, `make start` usa `docker compose` direto.

### Conflito na porta 47831 (nginx do host)

O Docker também expõe o nginx na **47831**. Se o nginx **do sistema** já usa essa porta, o container não sobe.

`kill $(lsof -t -i:47831)` **não resolve** — o master do nginx recria os workers.

Descubra qual config ocupa a porta:

```bash
sudo grep -r 47831 /etc/nginx/
ls -la /etc/nginx/sites-enabled/
```

Além de `gym-tunnel.conf`, pode ser `front.conf` / `api.conf` (configs antigas do gym).

Desative **todos** os sites do gym no host:

```bash
sudo rm -f /etc/nginx/sites-enabled/gym-tunnel.conf \
           /etc/nginx/sites-enabled/front.conf \
           /etc/nginx/sites-enabled/api.conf
sudo systemctl reload nginx
lsof -i :47831   # não deve listar nada
make start
```

| Modo | Quem usa a 47831 |
|------|------------------|
| Docker (`make start`) | container `nginx` |
| Host (legado) | arquivos em `/etc/nginx/sites-enabled/` |

Use **só um** dos dois.

| Serviço  | Porta interna | Acesso |
|----------|---------------|--------|
| nginx    | 47831 (host)  | entrada única |
| backend  | 3377          | via `/api/` |
| frontend | 3378          | via `/` |

Para parar:

```bash
make stop
```

## Banco SQLite + Git

Os dados ficam em `data/gym.db` e são versionados no Git como um “banco central”.

Fluxo recomendado:

1. `make start` — faz `git pull` e sobe os containers
2. Usa o app em http://localhost:47831
3. `make stop` — para os containers antes de salvar (evita conflito com o SQLite)
4. `make save MSG="descreva a alteração"` — commit + push do banco

```bash
make stop
make save MSG="cadastrei exercícios de peito"
make start   # se quiser continuar
```

Regras para evitar perda de dados:

- Sempre `git pull` antes de iniciar (`make start` já faz isso)
- Não rode em duas máquinas ao mesmo tempo
- Sempre `make save` ao finalizar a sessão

## Comandos Make

| Comando | Descrição |
|---------|-----------|
| `make start` | `git pull` + `docker compose up --build -d` |
| `make logs` | acompanha logs dos containers |
| `make ps` | status dos containers |
| `make save MSG="..."` | commit + push de `data/gym.db` |
| `make stop` | `docker compose down` |
| `make help` | lista os comandos |

## Endpoints da API

| Método | Rota |
|--------|------|
| POST | `/sessions` |
| GET/POST | `/exercises` |
| GET/PUT/DELETE | `/exercises/:id` |
| GET/POST | `/exercise-executions` |
| GET/PUT/DELETE | `/exercise-executions/:id` |
| GET | `/exercise-executions/:id/set-executions` |
| POST | `/set-executions` |
| GET | `/set-executions/:id/set-informations` |
| POST | `/set-informations` |

O frontend chama `/api/...`; o nginx repassa para o backend removendo o prefixo `/api`.
