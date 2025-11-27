# DDD (Domain-drive Design)

Design dirigido à domínio

## Domínio

- Domain Experts
  - Conversa
- Linguagem ubíqua

- Usuário
  - Client
  - Fornecedor
  - Atendente
  - Barman

- Agregados
- Value Objects
- Eventos de domínio
- Subdomínios (Bounded Contexts)
- Entidades
- Casos de uso


## Orientações para AI

- Para rodar os testes, utilize:
  ```bash
  npm run test
  ```

- Para rodar o projeto em modo desenvolvimento, utilize:
  ```bash
  npm run dev
  ```

- Para rodar o lint, utilize:
  ```bash
  npm run lint
  ```

- Para corrigir problemas de lint automaticamente, utilize:
  ```bash
  npm run lint:fix
  ```

- Para instalar dependências, utilize:
  ```bash
  npm install
  ```

- Estrutura de pastas importante:
  - `src/` contém o código principal
  - `test/` contém os repositórios in memory e configurações de testes
  - `README.md` contém a documentação

- Caso precise criar um novo caso de uso, siga o padrão dos arquivos em `src/domain/forum/application/use-cases/`.