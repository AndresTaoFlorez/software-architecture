// APPLICATION — coordinates a domain operation (flip status) and persists it
// through the port. The rule itself (how status flips) lives on the entity.

import type { User } from '../../domain/entities/User'
import type { UserRepository } from '../ports/UserRepository'
import { InvalidUserError } from '../../domain/errors/DomainErrors'

export function makeToggleUserStatusUseCase(userRepository: UserRepository) {
  return async function toggleUserStatus(userId: string): Promise<User> {
    const users = await userRepository.fetchAll()
    const user = users.find((u) => u.id === userId)
    if (!user) throw new InvalidUserError(`User ${userId} was not found.`)
    return userRepository.save(user.withToggledStatus())
  }
}
