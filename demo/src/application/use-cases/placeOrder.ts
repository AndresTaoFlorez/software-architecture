// APPLICATION — the use case. Orchestrates one operation, depends only on the
// domain and the port. It knows nothing about HTTP or the UI.

import type { OrderPort } from '../ports/OrderPort'
import type { Order } from '../../domain/entities/Order'
import { OrderNotPlaceableError } from '../../domain/errors/DomainErrors'

export interface PlaceOrderCommand {
  orderId: string
}

// A tracer receives a step per layer transition. Optional so the use case
// stays testable in isolation; the demo wires one from the Pinia trace store.
export interface TraceStep {
  layer: 'presentation' | 'application' | 'infrastructure' | 'domain'
  message: string
}
export type Tracer = (step: TraceStep) => void

export function makePlaceOrder(orders: OrderPort, tracer?: Tracer) {
  return async function placeOrder(
    cmd: PlaceOrderCommand,
    callTracer: Tracer = tracer ?? noop,
  ): Promise<Order> {
    callTracer({ layer: 'application', message: 'UseCase: placeOrder.run()' })

    const order = await orders.findById(cmd.orderId)
    callTracer({
      layer: 'infrastructure',
      message: `Port: findById(${cmd.orderId}) ${order ? '· hit' : '· miss'}`,
    })
    if (!order) throw new OrderNotPlaceableError('order not found')

    // The invariant lives on the entity, not in the use case. The use case
    // just orchestrates: load → confirm → save.
    order.confirm()
    callTracer({ layer: 'domain', message: 'Domain: order.confirm() · invariant ok' })

    const saved = await orders.save(order)
    callTracer({ layer: 'infrastructure', message: `Port: save(${cmd.orderId})` })
    callTracer({ layer: 'application', message: 'UseCase: returned confirmed order' })
    return saved
  }
}

const noop: Tracer = () => {}
