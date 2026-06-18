// APPLICATION — a PORT.
// The contract the use cases need. Infrastructure must satisfy it.
// In TypeScript a port is simply an interface: a contract, never an implementation.

import type { User } from '../../domain/entities/User'

export interface NewUserPayload {
  firstName: string
  lastName: string
  email: string
}

export interface UserRepository {
  fetchAll(): Promise<User[]>
  create(payload: NewUserPayload): Promise<User>
  save(user: User): Promise<User>
}
