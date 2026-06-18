// INFRASTRUCTURE — an in-memory adapter implementing OrderPort. Used by the
// live demo so it works without a backend. Same boundary mapping as the
// HttpOrderRepo: raw data → Domain entity, so nothing inward sees the seed.

import { Order, type OrderLine } from '../domain/entities/Order'
import { Money } from '../domain/entities/Money'
import type { OrderPort } from '../application/ports/OrderPort'

interface RawOrder {
  id: string
  status: 'draft' | 'confirmed' | 'cancelled'
  lines: { sku: string; qty: number; price: number; currency: string }[]
}

// Seed data: 2 drafts (one under free-shipping, one over), 1 confirmed,
// 1 cancelled. Totals are spread so OrderPolicy.qualifiesForFreeShipping
// shows both true and false in the panel.
const SEED: RawOrder[] = [
  {
    id: 'ord-1001',
    status: 'draft',
    lines: [
      { sku: 'BOOK-001', qty: 1, price: 18.5, currency: 'USD' },
      { sku: 'PEN-014', qty: 2, price: 4.25, currency: 'USD' },
    ],
  },
  {
    id: 'ord-1002',
    status: 'draft',
    lines: [
      { sku: 'DESK-MAT', qty: 1, price: 42.0, currency: 'USD' },
      { sku: 'LAMP-USB', qty: 1, price: 24.0, currency: 'USD' },
    ],
  },
  {
    id: 'ord-1003',
    status: 'confirmed',
    lines: [
      { sku: 'CHAIR-2', qty: 1, price: 199.0, currency: 'USD' },
    ],
  },
  {
    id: 'ord-1004',
    status: 'cancelled',
    lines: [
      { sku: 'MUG-RED', qty: 3, price: 9.5, currency: 'USD' },
    ],
  },
]

export class InMemoryOrderRepo implements OrderPort {
  private store: Map<string, Order>

  constructor(seed: RawOrder[] = SEED) {
    this.store = new Map(seed.map((raw) => [raw.id, this.toEntity(raw)]))
  }

  async findById(id: string): Promise<Order | null> {
    // Simulate a small async hop so the flow trace shows the call.
    await tick()
    return this.store.get(id) ?? null
  }

  async save(order: Order): Promise<Order> {
    await tick()
    // Re-store so the same instance is preserved by reference.
    this.store.set(order.id, order)
    return order
  }

  async list(): Promise<Order[]> {
    await tick()
    return Array.from(this.store.values())
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

// Small delay so the flow tracer actually shows each step (otherwise
// everything resolves in the same micro-task and the trace looks like one
// jump from store to done).
function tick(ms = 35): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
