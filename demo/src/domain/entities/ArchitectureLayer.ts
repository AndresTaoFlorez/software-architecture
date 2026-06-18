// DOMAIN — the heart. Pure business knowledge with no framework, no 3D, no
// I/O. An ArchitectureLayer models one ring of the onion and knows the single
// rule that defines Onion Architecture: a layer may only depend on layers
// deeper than itself.

export type LayerId = 'presentation' | 'infrastructure' | 'application' | 'domain'

/** One concrete thing that lives in a layer, with a glyph to make it scannable. */
export interface LayerItem {
  icon: string
  label: string
}

export class ArchitectureLayer {
  readonly id: LayerId
  /** 0 = outer skin, 3 = core. Smaller is further out. */
  readonly depth: number
  readonly name: string
  readonly tagline: string
  readonly role: string
  readonly analogy: string
  readonly rule: string
  readonly livesHere: readonly LayerItem[]
  readonly code: string
  readonly color: string
  /** Radius of this shell in the 3D scene. */
  readonly radius: number
  /** Emoji that stands for the layer itself. */
  readonly icon: string
  /** Emoji that illustrates the analogy. */
  readonly analogyIcon: string

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
    color: string
    radius: number
    icon: string
    analogyIcon: string
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
    this.color = params.color
    this.radius = params.radius
    this.icon = params.icon
    this.analogyIcon = params.analogyIcon
  }

  get isCore(): boolean {
    return this.depth === 3
  }

  /**
   * The dependency rule, made executable. A layer may point inward (to a
   * deeper layer) but never outward. The core depends on no one.
   */
  canDependOn(other: ArchitectureLayer): boolean {
    return other.depth > this.depth
  }
}
