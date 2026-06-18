// Content for the four layers, matching the exported design (the "Order" example).
// Listed outer to inner: 01 Presentation (skin) down to 04 Domain (core).

export type LayerId = 'presentation' | 'infrastructure' | 'application' | 'domain'

export interface Layer {
  id: LayerId
  num: string
  kicker: string
  name: string
  desc: string
  code: string
  color: string
}

export const LAYERS: Layer[] = [
  {
    id: 'presentation',
    num: '01',
    kicker: 'Outer skin',
    name: 'Presentation',
    desc: 'UI, components and stores call use cases, and never touch HTTP directly.',
    code: 'store.placeOrder()\n  → useCase.run(cmd)',
    color: '#e26da0',
  },
  {
    id: 'infrastructure',
    num: '02',
    kicker: 'Replaceable ring',
    name: 'Infrastructure',
    desc: 'Adapters (HTTP, storage, repositories) implement the ports.',
    code: 'class HttpOrderRepo\n  implements OrderPort',
    color: '#c272a0',
  },
  {
    id: 'application',
    num: '03',
    kicker: 'Orchestration',
    name: 'Application',
    desc: 'Use cases and ports orchestrate one operation, depending only on the domain.',
    code: 'placeOrder(cmd, ports)\n  → order.confirm()',
    color: '#e0b3cf',
  },
  {
    id: 'domain',
    num: '04',
    kicker: 'The core',
    name: 'Domain',
    desc: 'Where the business actually lives — entities, value objects, and the rules that make a valid order, a valid invoice, a valid anything. Pure code: no framework, no I/O, no awareness of UI or server. The only layer that stays the same whether it ships behind a React app, a CLI, or a unit test.',
    code: 'class Order {\n  confirm() { … }\n}',
    color: '#f3c878',
  },
]
