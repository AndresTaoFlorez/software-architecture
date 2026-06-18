// DOMAIN — named, catchable violations of business rules.

export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

export class OrderNotPlaceableError extends DomainError {
  constructor(reason: string) {
    super(`This order cannot be placed: ${reason}`)
    this.name = 'OrderNotPlaceableError'
  }
}
