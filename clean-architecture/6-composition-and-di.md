> **[Clean Architecture](README.md)** › Composition & Dependency Injection.

# 6. Composition and Dependency Injection

The canonical cross-architecture treatment now lives in **[Composition Root and Dependency Injection](../foundations/composition-root.md)**. This chapter keeps the Clean Architecture framing.

## 6.1 Why composition exists

An inner use case should depend on a capability it owns:

```ts
export interface UserRepository {
  findById(id: UserId): Promise<User | null>
}
```

A concrete outer adapter implements it:

```ts
export class HttpUserRepository implements UserRepository {
  constructor(private readonly http: HttpClient) {}

  async findById(id: UserId): Promise<User | null> {
    // map external data to the inner model
  }
}
```

Something must construct both and connect them. That location is the Composition Root.

## 6.2 Composition is not an exception to the Dependency Rule

The Composition Root sits at the outer edge. It is expected to know concrete mechanisms and the abstractions they satisfy.

```ts
const users = new HttpUserRepository(http)
const getUser = makeGetUser({ users })

const app = createApp({ getUser })
```

The use case still does not import `HttpUserRepository`.

## 6.3 Prefer injection over service location

Avoid:

```ts
export class GetUser {
  execute(id: string) {
    return container.resolve('users').findById(id)
  }
}
```

Prefer explicit constructor/factory dependencies.

## 6.4 Manual DI first

A DI container is not required by Clean Architecture.

Manual wiring is often clearer:

```ts
const repository = new HttpUserRepository(http)
const service = new UserService(repository)
```

Adopt a container when it solves a real object-graph/lifetime/framework problem. Do not use an arbitrary count such as "after N dependencies" as an architectural threshold.

## 6.5 Keep the root small

The root should assemble the graph, not implement use cases:

Typical Composition Root responsibilities are: create technical clients, create adapters, construct application services/use cases, construct delivery/store/controller objects, and finally start the framework/runtime.

Business branching belongs elsewhere.

## 6.6 One root per executable is reasonable

A web server, worker, CLI and browser bundle are different executable graphs and can each own a composition root.

## Sources

- Mark Seemann, "Composition Root": https://blog.ploeh.dk/2011/07/28/CompositionRoot/
- Robert C. Martin, "The Clean Architecture": https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
