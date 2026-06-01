SHELL := /bin/bash

DOMAIN=pihanaga-shadcn

ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
GIT_SHORT  := $(shell git rev-parse --short HEAD 2>/dev/null || echo "local")

TAR_FILE=${ROOT_DIR}/${DOMAIN}-${GIT_SHORT}-$(shell echo ${GIT_BRANCH} | sed -e 's/\//_/g').tgz

.DEFAULT_GOAL := help

.PHONY: help install dev build build-preview lint lint-fix type-check \
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

##@ Code Quality

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

clean: ## Remove build artefacts (dist, coverage)
	rm -rf ${ROOT_DIR}/dist ${ROOT_DIR}/coverage
