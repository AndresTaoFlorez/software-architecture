// DOMAIN — the innermost ring.
// A plain entity: business concepts and rules, with no framework, no I/O, no HTTP.
// It would remain meaningful if every technical choice around it were replaced.

export interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  isActive?: boolean
}

export class User {
  readonly id: string
  readonly firstName: string
  readonly lastName: string
  readonly email: string
  readonly isActive: boolean

  constructor(data: UserData) {
    this.id = data.id
    this.firstName = data.firstName
    this.lastName = data.lastName
    this.email = data.email
    this.isActive = data.isActive ?? true
  }

  // Derived state lives on the entity, computed once, reusable everywhere.
  get fullName(): string {
    return [this.firstName, this.lastName].filter(Boolean).join(' ')
  }

  get initials(): string {
    return [this.firstName, this.lastName]
      .filter(Boolean)
      .map((n) => n[0]!.toUpperCase())
      .join('')
  }

  // A business rule, expressed as behaviour rather than scattered `if`s in the UI.
  get statusLabel(): 'ACTIVE' | 'INACTIVE' {
    return this.isActive ? 'ACTIVE' : 'INACTIVE'
  }

  // Returns a new User with the status flipped (entities stay immutable).
  withToggledStatus(): User {
    return new User({ ...this.toData(), isActive: !this.isActive })
  }

  toData(): UserData {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      isActive: this.isActive,
    }
  }
}
