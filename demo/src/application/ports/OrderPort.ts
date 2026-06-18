// APPLICATION — a PORT. The contract the use case needs; Infrastructure implements it.

import type { Order } from '../../domain/entities/Order'

export interface OrderPort {
  findById(id: string): Promise<Order | null>
  save(order: Order): Promise<Order>
}
