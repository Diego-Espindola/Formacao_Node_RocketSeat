# Gym Project

Frontend Angular 18 para rastreamento de treinos.

## Estrutura

```
gym-frontend/
├── src/app/
│   ├── core/           # Interceptors, guards, API base
│   ├── models/         # Interfaces TypeScript das entidades
│   ├── services/       # CRUD com Signals
│   └── features/       # Telas (auth, exercícios, treinos)
```

## Como rodar

### 1. Backend mock (para testar o front)

```bash
cd gym-backend
npm install
npm run dev
```

Roda em `http://localhost:3333`. **Qualquer e-mail/senha** funciona no login.

### 2. Frontend

```bash
cd gym-frontend
npm install
npm start
```

Abre em `http://localhost:4200`. A API aponta para `http://localhost:3333` (`src/environments/environment.ts`).

## Endpoints esperados

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
