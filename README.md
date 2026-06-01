# pihanaga-shadcn

A Vite + React + TypeScript + Tailwind CSS + shadcn/ui starter.

## Stack

- **Build**: [Vite](https://vite.dev/) v6
- **UI Framework**: [React](https://react.dev/) v19
- **Language**: [TypeScript](https://www.typescriptlang.org/) ~5.8
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (new-york style)
- **Linting**: [ESLint](https://eslint.org/) v9 (flat config) + typescript-eslint
- **Testing**: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)

## Quick Start

```bash
# Install dependencies
yarn install

# Start development server
make dev          # or: yarn dev

# Run tests
make test         # or: yarn test

# Lint
make lint         # or: yarn lint

# Type check
make type-check   # or: yarn type-check

# Production build
make build        # or: yarn build
```

## Adding shadcn/ui Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

## Project Structure

```
src/
├── components/       # Shared components
│   └── ui/           # shadcn/ui components (auto-generated)
├── hooks/            # Custom React hooks
├── lib/
│   └── utils.ts      # cn() helper and shared utilities
├── pages/            # Page-level components
├── test/
│   └── setup.ts      # Vitest global test setup
├── App.tsx
├── App.test.tsx
├── index.css         # Tailwind CSS + CSS variables
├── main.tsx
└── vite-env.d.ts
```
