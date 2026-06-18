// INFRASTRUCTURE — a SECOND adapter for the very same port, backed by the
// browser's localStorage. Swapping this in for the in-memory one changes nothing
// in the Application or Presentation layers. That is the whole point of a port.

import { User, type UserData } from '../domain/entities/User'
import type { UserRepository, NewUserPayload } from '../application/ports/UserRepository'

const KEY = 'onion-demo:users'

const SEED: UserData[] = [
  { id: 'p1', firstName: 'Margaret', lastName: 'Hamilton', email: 'margaret@apollo.nasa', isActive: true },
  { id: 'p2', firstName: 'Katherine', lastName: 'Johnson', email: 'katherine@orbit.nasa', isActive: true },
]

export class LocalStorageUserRepository implements UserRepository {
  private read(): UserData[] {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED))
      return SEED.map((r) => ({ ...r }))
    }
    try {
      return JSON.parse(raw) as UserData[]
    } catch {
      return []
    }
  }

  private write(rows: UserData[]): void {
    localStorage.setItem(KEY, JSON.stringify(rows))
  }

  async fetchAll(): Promise<User[]> {
    await delay()
    return this.read().map((r) => new User(r))
  }

  async create(payload: NewUserPayload): Promise<User> {
    await delay()
    const rows = this.read()
    const row: UserData = { id: `p${Date.now()}`, isActive: true, ...payload }
    rows.push(row)
    this.write(rows)
    return new User(row)
  }

  async save(user: User): Promise<User> {
    await delay()
    const rows = this.read()
    const data = user.toData()
    const idx = rows.findIndex((r) => r.id === data.id)
    if (idx >= 0) rows[idx] = data
    else rows.push(data)
    this.write(rows)
    return new User(data)
  }
}

function delay(ms = 220): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
