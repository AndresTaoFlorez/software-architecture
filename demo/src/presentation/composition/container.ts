// PRESENTATION/composition — the composition root. Wires the port to an
// adapter and the use case to the port. UI stores import from here; the
// stores themselves never instantiate the adapter directly (dependency rule).

import { InMemoryOrderRepo } from '../../infrastructure/InMemoryOrderRepo'
import { makePlaceOrder } from '../../application/use-cases/placeOrder'

const orderRepo = new InMemoryOrderRepo()
const placeOrder = makePlaceOrder(orderRepo)

export const container = {
  orderRepo,
  placeOrder,
}
