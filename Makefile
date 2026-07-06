.PHONY: install dev run check build dist clean

install: ## Install dependencies
	npm install

dev: ## Run the app in development mode (Vite + hot reload)
	npm run dev

run: ## Build everything and launch the app like production
	npm start

check: ## Type-check the codebase
	npm run type-check

build: ## Build renderer + main process into dist/ and dist-electron/
	npm run build

dist: ## Package the app (.app, .dmg, .zip) into release/
	npm run dist

clean: ## Remove build artifacts
	rm -rf dist dist-electron release
