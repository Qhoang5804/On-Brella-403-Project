# On-Brella 403 Project - Makefile

.PHONY: help install build test clean run-hardware run-backend run-frontend setup-env

help:
	@echo "Available targets:"
	@echo "  make install        - Install all dependencies"
	@echo "  make build         - Build frontend for production"
	@echo "  make test          - Run backend tests"
	@echo "  make clean         - Remove node_modules and build outputs"
	@echo "  make setup-env     - Create backend/.env from .env.example"
	@echo "  make run-hardware  - Start hardware mock (port 3000)"
	@echo "  make run-backend   - Start backend API (port 5001)"
	@echo "  make run-frontend  - Start frontend dev server"

install:
	@npm install --prefix backend && \
	 npm install --prefix frontend && \
	 npm install --prefix hardwareSimulation

build:
	@npm run build --prefix frontend

test:
	@npm run test --prefix backend

clean:
	@rm -rf backend/node_modules frontend/node_modules hardwareSimulation/node_modules frontend/dist

setup-env:
	@test -f backend/.env || cp backend/.env.example backend/.env

run-hardware:
	@npm start --prefix hardwareSimulation

run-backend:
	@npm start --prefix backend

run-frontend:
	@npm run dev --prefix frontend
