import type { LayerSummary, LayerId } from '../application/use-cases/getLayers'

const visuals = {
  presentation: { color: '#ec3a78', radius: 2, icon: '🖥️', analogyIcon: '🍽️', items: ['🔘', '🧩', '🍍'] },
  infrastructure: { color: '#ff9f43', radius: 1.55, icon: '🔌', analogyIcon: '🚚', items: ['🌐', '🗄️', '💾'] },
  application: { color: '#34c6e8', radius: 1.15, icon: '⚙️', analogyIcon: '📋', items: ['🎬', '🔗', '📨'] },
  domain: { color: '#ffd25f', radius: 0.8, icon: '💛', analogyIcon: '✨', items: ['🧱', '💎', '⚖️'] },
} satisfies Record<LayerId, unknown>

export type LayerView = Omit<LayerSummary, 'livesHere'> & {
  color: string
  radius: number
  icon: string
  analogyIcon: string
  livesHere: { label: string; icon: string }[]
}

export function toLayerViews(layers: LayerSummary[]): LayerView[] {
  return layers.map(layer => ({
    ...layer,
    ...visuals[layer.id],
    livesHere: layer.livesHere.map((item, index) => ({
      label: item.label,
      icon: visuals[layer.id].items[index] ?? '',
    })),
  }))
}
