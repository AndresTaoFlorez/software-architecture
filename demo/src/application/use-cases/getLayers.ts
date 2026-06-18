// APPLICATION — the use case. It orchestrates one task: deliver the onion's
// layers ordered from the outer skin inward. It depends only on the domain
// and the port, never on how the content is actually stored.

import type { LayerContentPort } from '../ports/LayerContentPort'
import type { ArchitectureLayer } from '../../domain/entities/ArchitectureLayer'

export function makeGetLayers(content: LayerContentPort) {
  return function getLayers(): ArchitectureLayer[] {
    return content.all().slice().sort((a, b) => a.depth - b.depth)
  }
}
