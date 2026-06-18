// INFRASTRUCTURE — an adapter implementing the OrderPort. It maps raw transport
// data into Domain entities at the boundary, so nothing inward sees JSON.

import { Order, type OrderLine } from '../domain/entities/Order'
import { Money } from '../domain/entities/Money'
import type { OrderPort } from '../application/ports/OrderPort'

interface RawOrder {
  id: string
  status: 'draft' | 'confirmed' | 'cancelled'
  lines: { sku: string; qty: number; price: number; currency: string }[]
}

export class HttpOrderRepo implements OrderPort {
  private baseUrl: string

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  async findById(id: string): Promise<Order | null> {
    const res = await fetch(`${this.baseUrl}/orders/${id}`)
    if (res.status === 404) return null
    return this.toEntity(await res.json())
  }

  async save(order: Order): Promise<Order> {
    await fetch(`${this.baseUrl}/orders/${order.id}`, { method: 'PUT' })
    return order
  }

  private toEntity(raw: RawOrder): Order {
    const lines: OrderLine[] = raw.lines.map((l) => ({
      sku: l.sku,
      qty: l.qty,
      unitPrice: new Money(l.price, l.currency),
    }))
    return new Order(raw.id, lines, raw.status)
  }
}
