// DOMAIN — a policy: a pure business rule that doesn't belong to a single entity.

import type { Order } from '../entities/Order'

export const OrderPolicy = {
  // Free shipping is a business rule, decided here, never in a component.
  qualifiesForFreeShipping(order: Order): boolean {
    return order.total.amount >= 50
  },
}
