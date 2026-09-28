// Domain of the teaching app: lesson content and the selected dependency policy.
// Display order is not dependency rank; Presentation and Infrastructure are peers.

export type LayerId = 'presentation' | 'infrastructure' | 'application' | 'domain'

/** A concept taught by a lesson. Rendering glyphs belong to Presentation. */
export interface LayerItem {
  label: string
}

export class ArchitectureLayer {
  readonly id: LayerId
  /** Lesson display order, not canonical dependency rank. */
  readonly depth: number
  readonly name: string
  readonly tagline: string
  readonly role: string
  readonly analogy: string
  readonly rule: string
  readonly livesHere: readonly LayerItem[]
  readonly code: string

  constructor(params: {
    id: LayerId
    depth: number
    name: string
    tagline: string
    role: string
    analogy: string
    rule: string
    livesHere: readonly LayerItem[]
    code: string
  }) {
    this.id = params.id
    this.depth = params.depth
    this.name = params.name
    this.tagline = params.tagline
    this.role = params.role
    this.analogy = params.analogy
    this.rule = params.rule
    this.livesHere = params.livesHere
    this.code = params.code
  }

  get isCore(): boolean { return this.id === 'domain' }

  /** Strict project policy: outer peers do not depend on one another. */
  canDependOn(other: ArchitectureLayer): boolean {
    const allowed: Record<LayerId, readonly LayerId[]> = {
      domain: ['domain'],
      application: ['application', 'domain'],
      infrastructure: ['infrastructure', 'application', 'domain'],
      presentation: ['presentation', 'application'],
    }
    return allowed[this.id].includes(other.id)
  }
}
