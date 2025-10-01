SHELL := /bin/bash

.PHONY: dev-up dev-down dev-restart-frontend prod-up prod-restart-frontend health logs-backend logs-frontend

dev-up:
	docker-compose -f docker-compose.dev.yml up -d postgres redis backend frontend

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-restart-frontend:
	docker-compose -f docker-compose.dev.yml up -d --build frontend

prod-up:
	docker-compose up -d

prod-restart-frontend:
	docker-compose up -d --build frontend

health:
	curl -s http://localhost:8080/api/health || true

logs-backend:
	docker-compose -f docker-compose.dev.yml logs -f backend | cat

logs-frontend:
	docker-compose -f docker-compose.dev.yml logs -f frontend | cat





