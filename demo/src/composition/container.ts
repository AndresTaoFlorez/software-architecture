// Executable assembly. Consumers receive capabilities through props.
import { StaticLayerContent } from '../infrastructure/StaticLayerContent'
import { makeGetLayers } from '../application/use-cases/getLayers'

export const getLayers = makeGetLayers(new StaticLayerContent())
