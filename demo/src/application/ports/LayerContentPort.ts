// APPLICATION — a PORT. The contract the use case needs to obtain the layer
// content. The Application layer declares it; Infrastructure implements it.
// The use case depends on this interface, never on a concrete data source.

import type { ArchitectureLayer } from '../../domain/entities/ArchitectureLayer'

export interface LayerContentPort {
  all(): ArchitectureLayer[]
}
