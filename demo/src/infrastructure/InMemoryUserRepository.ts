// INFRASTRUCTURE — an adapter implementing the UserRepository port.
// It maps raw data into Domain entities at the boundary, so nothing inward
// ever sees a plain object. Here the "transport" is just an in-memory array.

import { User, type UserData } from '../domain/entities/User'
import type { UserRepository, NewUserPayload } from '../application/ports/UserRepository'

const SEED: UserData[] = [
  { id: 'u1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@analytical.engine', isActive: true },
  { id: 'u2', firstName: 'Alan', lastName: 'Turing', email: 'alan@bombe.uk', isActive: true },
  { id: 'u3', firstName: 'Grace', lastName: 'Hopper', email: 'grace@cobol.mil', isActive: false },
]

export class InMemoryUserRepository implements UserRepository {
  private rows: UserData[]

  constructor(seed: UserData[] = SEED) {
    // Clone so the seed is never mutated across resets.
    this.rows = seed.map((r) => ({ ...r }))
  }

  async fetchAll(): Promise<User[]> {
    await delay()
    return this.rows.map((r) => new User(r))
  }

  async create(payload: NewUserPayload): Promise<User> {
    await delay()
    const row: UserData = { id: `u${Date.now()}`, isActive: true, ...payload }
    this.rows.push(row)
    return new User(row)
  }

  async save(user: User): Promise<User> {
    await delay()
    const data = user.toData()
    const idx = this.rows.findIndex((r) => r.id === data.id)
    if (idx >= 0) this.rows[idx] = data
    else this.rows.push(data)
    return new User(data)
  }
}

// A tiny artificial latency so the async flow is visible in the UI.
function delay(ms = 220): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
