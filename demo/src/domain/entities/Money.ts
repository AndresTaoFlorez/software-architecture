// DOMAIN — a value object. Defined entirely by its attributes, with its own rules.

export class Money {
  readonly amount: number
  readonly currency: string

  constructor(amount: number, currency: string = 'USD') {
    if (amount < 0) throw new Error('Money cannot be negative.')
    this.amount = amount
    this.currency = currency
  }

  add(other: Money): Money {
    if (other.currency !== this.currency) throw new Error('Currency mismatch.')
    return new Money(this.amount + other.amount, this.currency)
  }

  get isZero(): boolean {
    return this.amount === 0
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`
  }
}
