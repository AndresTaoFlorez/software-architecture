// PRESENTATION edge — the COMPOSITION ROOT.
// This is the one and only place where a concrete adapter meets the use cases.
// Everything inward of here depends on the port, never on a concrete repository.

import { InMemoryUserRepository } from '../../infrastructure/InMemoryUserRepository'
import { LocalStorageUserRepository } from '../../infrastructure/LocalStorageUserRepository'
import { makeListUsersUseCase } from '../../application/use-cases/ListUsersUseCase'
import { makeCreateUserUseCase } from '../../application/use-cases/CreateUserUseCase'
import { makeToggleUserStatusUseCase } from '../../application/use-cases/ToggleUserStatusUseCase'
import type { UserRepository, NewUserPayload } from '../../application/ports/UserRepository'

export type AdapterName = 'in-memory' | 'localStorage'

// Two adapters, one port. Swapping between them is the demo's whole thesis.
const adapters: Record<AdapterName, UserRepository> = {
  'in-memory': new InMemoryUserRepository(),
  'localStorage': new LocalStorageUserRepository(),
}

let active: AdapterName = 'in-memory'

export function setAdapter(name: AdapterName): void {
  active = name
}
export function activeAdapter(): AdapterName {
  return active
}

function repository(): UserRepository {
  return adapters[active]
}

// Use cases are wired to whichever adapter is active *right now*. Because they
// only ever touch the port, this rewiring is invisible to them.
export const useCases = {
  listUsers: () => makeListUsersUseCase(repository())(),
  createUser: (payload: NewUserPayload) => makeCreateUserUseCase(repository())(payload),
  toggleStatus: (id: string) => makeToggleUserStatusUseCase(repository())(id),
}
