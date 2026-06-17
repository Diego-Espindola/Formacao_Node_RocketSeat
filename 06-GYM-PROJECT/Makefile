MSG ?= atualiza banco gym

ifeq ($(shell docker info >/dev/null 2>&1 && echo ok),ok)
  COMPOSE = docker compose
else
  COMPOSE = sudo docker compose
endif

.PHONY: help start save stop logs ps check-port

help:
	@echo "Uso:"
	@echo "  make start              # git pull + sobe Docker em background"
	@echo "  make logs               # acompanha logs dos containers"
	@echo "  make ps                 # status dos containers"
	@echo "  make save MSG=\"...\"     # commit + push do gym.db"
	@echo "  make stop               # para containers"
	@echo ""
	@echo "Docker: $(COMPOSE)"

check-port:
	@if ss -tln | grep -q ':47831 '; then \
		if ! $(COMPOSE) ps --status running 2>/dev/null | grep -q nginx; then \
			echo "Erro: porta 47831 ocupada por outro processo (não é o Docker do gym)."; \
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

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

save:
	git add data/gym.db
	@if git diff --cached --quiet; then \
		echo "Nada mudou no banco."; \
	else \
		git commit -m "$(MSG)"; \
		git push; \
		echo "Banco salvo no Git."; \
	fi

stop:
	$(COMPOSE) down
