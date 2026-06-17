MSG ?= atualiza seed gym

ifeq ($(shell docker info >/dev/null 2>&1 && echo ok),ok)
  COMPOSE = docker compose
else
  COMPOSE = sudo docker compose
endif

.PHONY: help start save stop logs ps export import reset check-port

help:
	@echo "Uso:"
	@echo "  make start              # git pull + sobe Docker (migrate + seed se vazio)"
	@echo "  make save MSG=\"...\"     # export seed.json + commit + push"
	@echo "  make export             # exporta Postgres -> data/seed.json"
	@echo "  make import             # importa seed (só se banco vazio)"
	@echo "  make reset              # zera banco e reimporta seed.json"
	@echo "  make logs               # acompanha logs"
	@echo "  make ps                 # status dos containers"
	@echo "  make stop               # para containers"
	@echo ""
	@echo "Docker: $(COMPOSE)"

check-port:
	@if ss -tln | grep -q ':47831 '; then \
		if ! $(COMPOSE) ps --status running 2>/dev/null | grep -q nginx; then \
			echo "Erro: porta 47831 ocupada por outro processo."; \
			echo "Confira: ss -tln | grep 47831"; \
			exit 1; \
		fi; \
	fi

start: check-port
	git pull
	$(COMPOSE) up --build -d
	@echo ""
	@echo "Gym rodando em http://localhost:47831"
	@echo "Logs: make logs"

export:
	$(COMPOSE) run --rm --entrypoint sh backend -c "npx prisma generate && npm run db:export"

import:
	$(COMPOSE) run --rm --entrypoint sh backend -c "npx prisma generate && npm run db:import"

reset:
	$(COMPOSE) run --rm --entrypoint sh backend -c "npx prisma generate && npx prisma migrate reset --force && node scripts/import-seed.js"

save: export
	git add data/seed.json gym-backend/prisma/migrations
	@if git diff --cached --quiet; then \
		echo "Nada mudou no seed/migrations."; \
	else \
		git commit -m "$(MSG)"; \
		git push; \
		echo "Seed salvo no Git."; \
	fi

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

stop:
	$(COMPOSE) down
