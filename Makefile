COMPOSE := docker compose

.PHONY: dev-build dev-run dev-kill dev-data

dev-build:
	$(COMPOSE) build

dev-run:
	$(COMPOSE) up

dev-kill:
	$(COMPOSE) down --remove-orphans

dev-data:
	$(COMPOSE) run --rm backend python -m app.ingest
