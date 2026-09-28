// APPLICATION — the use case. It orchestrates one task: deliver the onion's
// layers ordered from the outer skin inward. It depends only on the domain
// and the port, never on how the content is actually stored.

import type { LayerContentPort } from '../ports/LayerContentPort'
import type { ArchitectureLayer } from '../../domain/entities/ArchitectureLayer'
export type { LayerId } from '../../domain/entities/ArchitectureLayer'

// Application result: plain lesson data, not a domain object passed to UI.
export interface LayerSummary {
  id: ArchitectureLayer['id']
  depth: number
  name: string
  tagline: string
  role: string
  analogy: string
  rule: string
  livesHere: readonly { label: string }[]
  code: string
  isCore: boolean
}

export function makeGetLayers(content: LayerContentPort) {
  return function getLayers(): LayerSummary[] {
    return content.all().slice().sort((a, b) => a.depth - b.depth).map(layer => ({
      id: layer.id, depth: layer.depth, name: layer.name, tagline: layer.tagline,
      role: layer.role, analogy: layer.analogy, rule: layer.rule,
      livesHere: layer.livesHere.map(item => ({ label: item.label })),
      code: layer.code, isCore: layer.isCore,
    }))
  }
}
