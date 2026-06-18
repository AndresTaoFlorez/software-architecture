// DOMAIN — the core entity. Business rules and behaviour, no framework, no I/O.

import { Money } from './Money'

export type OrderStatus = 'draft' | 'confirmed' | 'cancelled'

export interface OrderLine {
  sku: string
  qty: number
  unitPrice: Money
}

export class Order {
  readonly id: string
  readonly lines: OrderLine[]
  // Public so the view can render the badge; only `confirm()` mutates it.
  status: OrderStatus

  constructor(id: string, lines: OrderLine[], status: OrderStatus = 'draft') {
    this.id = id
    this.lines = lines
    this.status = status
  }

  get total(): Money {
    return this.lines.reduce(
      (sum, l) => sum.add(new Money(l.unitPrice.amount * l.qty, l.unitPrice.currency)),
      new Money(0),
    )
  }

  get isConfirmed(): boolean {
    return this.status === 'confirmed'
  }

  // A business invariant lives here, not in the UI or the use case.
  confirm(): void {
    if (this.lines.length === 0) throw new Error('Cannot confirm an empty order.')
    if (this.status !== 'draft') throw new Error('Only a draft order can be confirmed.')
    this.status = 'confirmed'
  }
}
