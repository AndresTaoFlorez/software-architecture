// APPLICATION — a use case with real orchestration: it validates application-level
// rules and raises DOMAIN errors before any data reaches Infrastructure.

import type { User } from '../../domain/entities/User'
import type { UserRepository, NewUserPayload } from '../ports/UserRepository'
import { EmailAlreadyExistsError, InvalidUserError } from '../../domain/errors/DomainErrors'

export function makeCreateUserUseCase(userRepository: UserRepository) {
  return async function createUser(payload: NewUserPayload): Promise<User> {
    const firstName = payload.firstName.trim()
    const lastName = payload.lastName.trim()
    const email = payload.email.trim().toLowerCase()

    if (!firstName) throw new InvalidUserError('First name is required.')
    if (!email) throw new InvalidUserError('Email is required.')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new InvalidUserError('That email does not look valid.')
    }

    const existing = await userRepository.fetchAll()
    if (existing.some((u) => u.email.toLowerCase() === email)) {
      throw new EmailAlreadyExistsError(email)
    }

    return userRepository.create({ firstName, lastName, email })
  }
}
