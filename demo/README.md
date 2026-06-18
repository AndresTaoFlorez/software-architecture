# Onion Architecture — live demo

A tiny Vue 3 app that puts the [Onion Architecture guide](../README.md) into practice. It is the
single home for everything behind the GitHub Pages site.

**Live:** https://andrestaoflorez.github.io/onion-architecture/

## What it shows

- The **four layers** wired exactly as the guide prescribes, with dependencies pointing inward.
- A **runtime adapter swap** (in-memory ↔ localStorage): the same port, two implementations, and the
  Application and Presentation layers never change.
- A **data-flow tracer** that animates each request travelling `View → Store → UseCase → Repository`.

## Layout (the four rings)

```
src/
├── domain/                 # entities + domain errors (no framework, no I/O)
│   ├── entities/User.ts
│   └── errors/DomainErrors.ts
├── application/            # use cases + the port they depend on
│   ├── ports/UserRepository.ts
│   └── use-cases/*.ts
├── infrastructure/         # two adapters implementing the same port
│   ├── InMemoryUserRepository.ts
│   └── LocalStorageUserRepository.ts
└── presentation/           # Vue: stores, components, composition root
    ├── composition/container.ts   # the one place a concrete adapter is chosen
    ├── stores/*.ts
    └── components/*.vue
```

## Run it locally

```bash
bun install
bun dev          # http://localhost:5173
bun run build    # type-check + production build into dist/
```

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml` at the repo root) builds this folder with
Bun and publishes `demo/dist` to GitHub Pages on every push to `main`.
