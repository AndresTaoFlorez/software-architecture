// INFRASTRUCTURE — an adapter implementing LayerContentPort. Here it is a
// static source, but it could just as easily fetch from a CMS or an API: the
// inner layers would never know the difference. That swap-ability is the whole
// point of keeping data access out at the edge.

import { ArchitectureLayer } from '../domain/entities/ArchitectureLayer'
import type { LayerContentPort } from '../application/ports/LayerContentPort'

export class StaticLayerContent implements LayerContentPort {
  all(): ArchitectureLayer[] {
    return [
      new ArchitectureLayer({
        id: 'presentation',
        depth: 0,
        name: 'Presentation',
        tagline: 'What you see and click',
        role: 'The screens, buttons and pages. It shows things to the person using the app and reacts when they tap or type.',
        analogy: 'The waiter — takes your order and brings your food, but never cooks it.',
        rule: 'It asks the inside to do the real work. It never talks to a server or a database by itself.',
        livesHere: [
          { icon: '🔘', label: 'Buttons & pages' },
          { icon: '🧩', label: 'Vue components' },
          { icon: '🍍', label: 'Stores (Pinia)' },
        ],
        code: 'function onPlaceOrder() {\n  // just ask the inside to do it\n  placeOrder({ orderId })\n}',
        color: '#e2618f',
        radius: 2.0,
        icon: '🖥️',
        analogyIcon: '🍽️',
      }),
      new ArchitectureLayer({
        id: 'infrastructure',
        depth: 1,
        name: 'Infrastructure',
        tagline: 'The doors to the outside world',
        role: 'The code that talks to servers, databases and browser storage, turning messy outside data into clean shapes the app understands.',
        analogy: 'The suppliers and delivery trucks — you can swap them without changing the recipe.',
        rule: 'It is replaceable. Swap a real server for a fake one and the inner layers never notice.',
        livesHere: [
          { icon: '🌐', label: 'API / fetch calls' },
          { icon: '🗄️', label: 'Repositories' },
          { icon: '💾', label: 'Local storage' },
        ],
        code: 'class HttpOrderRepo\n  implements OrderPort {\n  findById(id) { /* fetch */ }\n}',
        color: '#b56aa6',
        radius: 1.55,
        icon: '🔌',
        analogyIcon: '🚚',
      }),
      new ArchitectureLayer({
        id: 'application',
        depth: 2,
        name: 'Application',
        tagline: 'The steps to get one thing done',
        role: 'Use cases. Each one coordinates a single task from start to finish — like "place an order" — by giving instructions to the core.',
        analogy: 'The recipe steps — follow them in order to turn ingredients into a dish.',
        rule: 'It orchestrates the task but knows nothing about screens or servers. It only knows the core and its ports.',
        livesHere: [
          { icon: '🎬', label: 'Use cases' },
          { icon: '🔗', label: 'Ports (interfaces)' },
          { icon: '📨', label: 'Commands' },
        ],
        code: 'function placeOrder(cmd, ports) {\n  const o = ports.find(cmd.id)\n  o.confirm()\n  ports.save(o)\n}',
        color: '#e7b2d0',
        radius: 1.15,
        icon: '⚙️',
        analogyIcon: '📋',
      }),
      new ArchitectureLayer({
        id: 'domain',
        depth: 3,
        name: 'Domain',
        tagline: 'The heart — rules that are always true',
        role: 'The business itself: what an order is, when it is valid, what it can and cannot do. Pure logic, no screens, no internet.',
        analogy: 'The soul of the app — still true even with no app around it.',
        rule: 'It knows nothing about anything outside it. Everything depends on the core; the core depends on no one.',
        livesHere: [
          { icon: '🧱', label: 'Entities' },
          { icon: '💎', label: 'Value objects' },
          { icon: '⚖️', label: 'Business rules' },
        ],
        code: 'class Order {\n  confirm() {\n    if (this.isEmpty) throw Error()\n  }\n}',
        color: '#f4c95f',
        radius: 0.8,
        icon: '💛',
        analogyIcon: '✨',
      }),
    ]
  }
}
