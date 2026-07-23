s which are NOT covered by any of hte SHELL := /bin/bash

DOMAIN=pihanga-shadcn

ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
GIT_SHORT  := $(shell git rev-parse --short HEAD 2>/dev/null || echo "local")

TAR_FILE=${ROOT_DIR}/${DOMAIN}-${GIT_SHORT}-$(shell echo ${GIT_BRANCH} | sed -e 's/\//_/g').tgz

.DEFAULT_GOAL := help

.PHONY: help install dev build build-preview gen-playground gen-registry \
        build-core build-core-dry publish \
        build-extras build-extras-dry build-graphin build-chart build-markdown \
        publish-graphin publish-chart publish-markdown publish-all \
        check lint lint-fix type-check \
        test test-run test-ui test-coverage \
        clean src-dist tar tar-echo

help: ## Show this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} \
	  /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } \
	  /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) }' \
	  $(MAKEFILE_LIST)

##@ Setup

install: ## Install dependencies
	yarn install

##@ Development

dev: install ## Start Vite development server
	yarn dev

build: install ## Build production bundle
	rm -rf ${ROOT_DIR}/dist
	yarn build

build-preview: build ## Build then preview production bundle
	yarn preview

gen-playground: ## (Re)generate src/playground/playground.examples.gen.ts
	node scripts/gen-playground-registry.mjs

gen-registry: ## Generate shadcn registry JSON files in public/r/ (Option D distribution)
	node scripts/gen-registry.mjs

build-core: install ## Build @pihanga2/shadcn npm package into dist-lib/
	node scripts/build-core.mjs

build-core-dry: ## Preview @pihanga2/shadcn build without writing files (dry-run)
	node scripts/build-core.mjs --dry-run

publish: check build-core ## Build and publish @pihanga2/shadcn to npm
	cd ${ROOT_DIR}/dist-lib && npm publish --access public

build-extras: install ## Build all extra card packages (graphin, chart, markdown)
	node scripts/build-extras.mjs

build-extras-dry: ## Preview all extra package builds without writing files
	node scripts/build-extras.mjs --dry-run

build-graphin: install ## Build @pihanga2/graphin into dist-lib-graphin/
	node scripts/build-extras.mjs --pkg graphin

build-chart: install ## Build @pihanga2/chart into dist-lib-chart/
	node scripts/build-extras.mjs --pkg chart

build-markdown: install ## Build @pihanga2/markdown into dist-lib-markdown/
	node scripts/build-extras.mjs --pkg markdown

publish-all: publish publish-graphin publish-chart publish-markdown ## Build and publish all four packages to npm

publish-graphin: build-graphin ## Build and publish @pihanga2/graphin to npm
	cd ${ROOT_DIR}/dist-lib-graphin && npm publish --access public

publish-chart: build-chart ## Build and publish @pihanga2/chart to npm
	cd ${ROOT_DIR}/dist-lib-chart && npm publish --access public

publish-markdown: build-markdown ## Build and publish @pihanga2/markdown to npm
	cd ${ROOT_DIR}/dist-lib-markdown && npm publish --access public

##@ Code Quality

check: lint type-check test-run ## Run all checks: lint, type-check, and tests (CI)

lint: ## Run ESLint
	yarn lint

lint-fix: ## Run ESLint with auto-fix
	yarn lint:fix

type-check: ## Run TypeScript type checking (no emit)
	yarn type-check

##@ Testing

test: ## Run Vitest in watch mode
	yarn test

test-run: ## Run Vitest once (CI mode)
	yarn test:run

test-ui: ## Open Vitest browser UI
	yarn test:ui

test-coverage: ## Run tests with coverage report
	yarn test:coverage

##@ Archive

src-dist: ## Create a source distribution tarball (dist.tgz)
	@tar -c \
	  --exclude node_modules \
	  --exclude dist \
	  --exclude coverage \
	  --exclude '*.tgz' \
	  -z -f ${ROOT_DIR}/dist.tgz .
	@echo ">>>> Created dist.tgz"

tar: build ## Build production bundle and create deployment tarball
	cd ${ROOT_DIR}/dist && tar zcf ${TAR_FILE} *
	@echo ">>>> Successfully built '${TAR_FILE}'"

tar-echo: ## Print the deployment tarball filename
	@echo ${TAR_FILE}

##@ Cleanup

clean: ## Remove build artefacts (dist, dist-lib, dist-lib-*, coverage)
	rm -rf ${ROOT_DIR}/dist ${ROOT_DIR}/dist-lib \
	       ${ROOT_DIR}/dist-lib-graphin ${ROOT_DIR}/dist-lib-chart \
	       ${ROOT_DIR}/dist-lib-markdown ${ROOT_DIR}/coverage
