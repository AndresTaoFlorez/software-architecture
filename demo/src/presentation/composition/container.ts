// PRESENTATION / composition root. The one place allowed to know every layer.
// It wires the concrete adapter to the port and the use case to the port, then
// hands the rest of the UI a ready-to-call function. Components import from
// here; they never instantiate an adapter themselves (the dependency rule).

import { StaticLayerContent } from '../../infrastructure/StaticLayerContent'
import { makeGetLayers } from '../../application/use-cases/getLayers'

const content = new StaticLayerContent()
const getLayers = makeGetLayers(content)

export const container = {
  getLayers,
}
