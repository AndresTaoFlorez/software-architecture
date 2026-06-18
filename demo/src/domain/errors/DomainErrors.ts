// DOMAIN — named, catchable violations of business rules.
// Outer layers can `catch (e) { if (e instanceof EmailAlreadyExistsError) ... }`
// and react precisely, instead of parsing anonymous strings.

export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

export class EmailAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`A user with the email "${email}" already exists.`)
    this.name = 'EmailAlreadyExistsError'
  }
}

export class InvalidUserError extends DomainError {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidUserError'
  }
}
