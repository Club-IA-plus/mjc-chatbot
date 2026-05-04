COMPOSE := docker compose

.PHONY: dev-build dev-run dev-kill

dev-build:
	$(COMPOSE) build

dev-run:
	$(COMPOSE) up

dev-kill:
	$(COMPOSE) down --remove-orphans
