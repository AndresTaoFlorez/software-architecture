# Software Architecture Reference

You can already write programs. This handbook helps you decide where a piece of code belongs, which other code it may use and how to change it without disturbing unrelated work. You do not need architecture vocabulary or Nest knowledge to begin.

**Contents**

- [How to use the handbook](#how-to-use-the-handbook)
- [Read first](#read-first)
- [Choose your next route](#choose-your-next-route)
- [Find a reference](#find-a-reference)

## How to use the handbook

Follow one support request through the common route below. Read the code, identify who makes each decision and then learn the formal name. Use the [Glossary](GLOSSARY.md) when you need a reminder; essential terms are explained where they first matter.

The snippets illustrate an application's files. This repository contains documentation, not an executable application. When an exercise uses imports, combine the referenced canonical modules with its changed files in your own temporary project.

<a id="where-to-start"></a>

## Read first

1. [Foundations introduction](architecture/foundations/README.md): a familiar support request.
2. [Code Placement](architecture/foundations/code-placement.md): give each decision an owner.
3. [Dependency Boundaries](architecture/foundations/dependency-boundaries.md): understand what code uses what.
4. [Composition](architecture/foundations/composition-root.md): supply concrete objects at startup.
5. [Module Boundaries](architecture/foundations/module-boundaries-and-public-apis.md): expose a supported way to use a capability.
6. [HTTP Request to Business Operation](architecture/backend/1-http-request-to-business-operation.md): follow a real incoming request.
7. [TypeScript-First Boundaries](architecture/backend/2-typescript-first-boundaries.md): inspect the complete small ticket example.

## Choose your next route

- [Backend](architecture/backend/README.md): continue with Nest, persistence and backend exercises.
- [Frontend](architecture/frontend/README.md): continue with screens, external integrations, state and frontend exercises.

After the concrete example, [styles](architecture/styles/README.md) explain Layered, Hexagonal, Clean and Onion. [Presentation patterns](architecture/patterns/presentation/README.md) offer an optional MVC/MVVM continuation for frontend readers.

Read [architectural checks](architecture/foundations/architecture-testing.md) and [evolution](architecture/foundations/evolution-and-scaling.md) later, when you can trace the examples yourself.

## Find a reference

| Area | Purpose |
| --- | --- |
| [Architecture map](architecture/README.md) | The common route and its continuations |
| [Patterns](architecture/patterns/README.md) | Focused presentation, persistence and structural decisions |
| [Conventions](architecture/conventions/README.md) | Naming and handbook structure |
| [Glossary](GLOSSARY.md) | Short reminders of terms |
| [Contributing](CONTRIBUTING.md) | The editorial standard |
| [Extras](extras/README.md) | Adjacent disciplines taught separately |
