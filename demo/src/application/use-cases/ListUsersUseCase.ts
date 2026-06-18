// APPLICATION — a use case. Orchestrates one operation, depends only on the PORT.
// It has no idea whether the data comes from memory, localStorage, or HTTP.

import type { User } from '../../domain/entities/User'
import type { UserRepository } from '../ports/UserRepository'

export function makeListUsersUseCase(userRepository: UserRepository) {
  return function listUsers(): Promise<User[]> {
    return userRepository.fetchAll()
  }
}
