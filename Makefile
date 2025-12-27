# Makefile for Markdown Editor Monorepo
# Frontend: React + TypeScript + Vite
# Backend: Python + FastAPI

.PHONY: help install dev build lint format typecheck test check clean ci preview \
        frontend.install frontend.dev frontend.build frontend.lint frontend.typecheck frontend.clean frontend.preview \
        backend.install backend.dev backend.lint backend.format backend.typecheck backend.test backend.test.cov backend.clean \
        db.reset

# Default target
.DEFAULT_GOAL := help

# Variables
UV := uv
NPM := npm

# Colors for help output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

#==============================================================================
# Help
#==============================================================================

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "$(GREEN)Common Commands:$(RESET)"
	@echo "  $(CYAN)install$(RESET)              Install all dependencies"
	@echo "  $(CYAN)dev$(RESET)                  Start all development servers"
	@echo "  $(CYAN)build$(RESET)                Build all projects"
	@echo "  $(CYAN)lint$(RESET)                 Run all linters"
	@echo "  $(CYAN)format$(RESET)               Format all code"
	@echo "  $(CYAN)typecheck$(RESET)            Run all type checks"
	@echo "  $(CYAN)test$(RESET)                 Run all tests"
	@echo "  $(CYAN)check$(RESET)                Run lint, typecheck, and test"
	@echo "  $(CYAN)clean$(RESET)                Clean all build artifacts"
	@echo "  $(CYAN)ci$(RESET)                   Run full CI pipeline"
	@echo ""
	@echo "$(GREEN)Frontend Commands:$(RESET) (make frontend.xxx)"
	@echo "  $(CYAN)frontend.install$(RESET)     Install frontend dependencies"
	@echo "  $(CYAN)frontend.dev$(RESET)         Start Vite dev server"
	@echo "  $(CYAN)frontend.build$(RESET)       Build for production"
	@echo "  $(CYAN)frontend.lint$(RESET)        Run ESLint"
	@echo "  $(CYAN)frontend.typecheck$(RESET)   Run TypeScript type check"
	@echo "  $(CYAN)frontend.preview$(RESET)     Preview production build"
	@echo "  $(CYAN)frontend.clean$(RESET)       Clean build artifacts"
	@echo ""
	@echo "$(GREEN)Backend Commands:$(RESET) (make backend.xxx)"
	@echo "  $(CYAN)backend.install$(RESET)      Install backend dependencies"
	@echo "  $(CYAN)backend.dev$(RESET)          Start FastAPI dev server"
	@echo "  $(CYAN)backend.lint$(RESET)         Run Ruff linter"
	@echo "  $(CYAN)backend.format$(RESET)       Format with Ruff"
	@echo "  $(CYAN)backend.typecheck$(RESET)    Run mypy type check"
	@echo "  $(CYAN)backend.test$(RESET)         Run pytest"
	@echo "  $(CYAN)backend.test.cov$(RESET)     Run pytest with coverage"
	@echo "  $(CYAN)backend.clean$(RESET)        Clean Python artifacts"
	@echo ""
	@echo "$(GREEN)Database Commands:$(RESET) (make db.xxx)"
	@echo "  $(CYAN)db.reset$(RESET)             Reset the database"

#==============================================================================
# Common Commands
#==============================================================================

install: backend.install frontend.install ## Install all dependencies

dev: ## Start all development servers
	@echo "Starting development servers..."
	@make -j2 frontend.dev backend.dev

build: frontend.build ## Build all projects

lint: frontend.lint backend.lint ## Run all linters

format: backend.format ## Format all code

typecheck: frontend.typecheck backend.typecheck ## Run all type checks

test: backend.test ## Run all tests

check: lint typecheck test ## Run lint, typecheck, and test

clean: frontend.clean backend.clean ## Clean all build artifacts

ci: install check build ## Run full CI pipeline

preview: frontend.preview ## Preview production build

#==============================================================================
# Frontend Commands
#==============================================================================

frontend.install: ## Install frontend dependencies
	$(NPM) install

frontend.dev: ## Start Vite dev server
	$(NPM) run dev

frontend.build: ## Build frontend for production
	$(NPM) run build

frontend.lint: ## Run ESLint
	$(NPM) run lint

frontend.typecheck: ## Run TypeScript type check
	npx tsc --noEmit

frontend.preview: ## Preview production build
	$(NPM) run preview

frontend.clean: ## Clean frontend build artifacts
	rm -rf frontend/dist
	rm -rf node_modules/.vite

#==============================================================================
# Backend Commands
#==============================================================================

backend.install: ## Install backend dependencies
	$(UV) sync --all-extras

backend.dev: ## Start FastAPI dev server
	$(UV) run uvicorn backend.app.main:app --reload --port 8000

backend.lint: ## Run Ruff linter
	$(UV) run ruff check backend/

backend.format: ## Format with Ruff
	$(UV) run ruff format backend/
	$(UV) run ruff check --fix backend/

backend.typecheck: ## Run mypy type check
	$(UV) run mypy backend/

backend.test: ## Run pytest
	$(UV) run pytest backend/tests/ -v

backend.test.cov: ## Run pytest with coverage
	$(UV) run pytest backend/tests/ -v --cov=backend --cov-report=html

backend.clean: ## Clean Python artifacts
	find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find backend -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf .pytest_cache
	rm -rf .mypy_cache
	rm -rf .ruff_cache
	rm -rf htmlcov

#==============================================================================
# Database Commands
#==============================================================================

db.reset: ## Reset the database
	rm -f markdown_editor.db
	@echo "Database reset complete. It will be recreated on next backend start."

#==============================================================================
# Full Clean (including dependencies)
#==============================================================================

clean.all: clean ## Clean everything including dependencies
	rm -rf node_modules
	rm -rf .venv
