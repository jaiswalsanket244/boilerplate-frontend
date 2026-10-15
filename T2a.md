build: Builds the production Next.js app (`next build`).
dev: Starts the Next.js development server with hot reload (`next dev`).
lint: Lints the whole project with ESLint (`eslint .`).
typecheck: Type-checks the project with TypeScript without emitting files (`tsc --noEmit`).
start: Starts the built Next.js app in production mode (`next start`).
postinstall: Sets up Husky git hooks after dependencies install (`npx husky`).
test: Runs the Vitest unit test suite once (`vitest run`).
test:watch: Runs Vitest in watch mode, re-running tests on changes (`vitest`).
test:e2e: Runs the Playwright end-to-end tests (`playwright test`).
postbuild: After `build`, copies `public` and `.next/static` into `.next/standalone` for standalone deployment.
