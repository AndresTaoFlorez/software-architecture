// Explanatory content for each ring of the onion, distilled from the guide.
// Kept as data so the interactive diagram and the detail panel share one source.

export type LayerId = 'domain' | 'application' | 'infrastructure' | 'presentation'

export interface LayerInfo {
  id: LayerId
  name: string
  oneLiner: string
  dependsOn: string
  lives: string[]
  mustNot: string
  example: string
  inThisDemo: string
}

export const LAYERS: Record<LayerId, LayerInfo> = {
  domain: {
    id: 'domain',
    name: 'Domain',
    oneLiner: 'Business concepts and rules, in their purest form. The part that would still be true with no UI and no server.',
    dependsOn: 'Nothing at all',
    lives: ['Entities', 'Value objects', 'Domain errors', 'Invariants'],
    mustNot: 'Import a framework, do I/O, touch HTTP or localStorage, or know a UI exists.',
    example: `class User {
  get fullName() {
    return \`\${this.firstName} \${this.lastName}\`
  }
  get statusLabel() {
    return this.isActive ? 'ACTIVE' : 'INACTIVE'
  }
}`,
    inThisDemo: 'src/domain/ — the User entity and DomainErrors.',
  },
  application: {
    id: 'application',
    name: 'Application',
    oneLiner: 'Orchestrates one business operation: a use case. It coordinates the domain and the ports it needs.',
    dependsOn: 'Domain + its own ports',
    lives: ['Use cases', 'Ports (interfaces)'],
    mustNot: 'Render anything, read reactive state, call an HTTP client, or depend on a concrete adapter.',
    example: `function makeCreateUserUseCase(repo: UserRepository) {
  return (payload) => {
    // validate, then delegate to the PORT
    return repo.create(payload)
  }
}`,
    inThisDemo: 'src/application/ — use cases + the UserRepository port.',
  },
  infrastructure: {
    id: 'infrastructure',
    name: 'Infrastructure',
    oneLiner: 'Adapters that talk to the outside world and map raw data into entities. The most replaceable ring.',
    dependsOn: 'Domain + the ports it implements',
    lives: ['HTTP client', 'Repositories', 'Realtime', 'Storage'],
    mustNot: 'Contain business rules, or depend on Presentation.',
    example: `class LocalStorageUserRepository
  implements UserRepository {
  async fetchAll() {
    return this.read().map(r => new User(r))
  }
}`,
    inThisDemo: 'src/infrastructure/ — two adapters for one port. Swap them with the toggle below.',
  },
  presentation: {
    id: 'presentation',
    name: 'Presentation',
    oneLiner: 'Renders the UI, holds reactive state, and turns user intent into use-case calls.',
    dependsOn: 'Application (and, through it, the Domain)',
    lives: ['Views', 'Components', 'Stores', 'Router'],
    mustNot: 'Call the HTTP client directly, embed business rules, or build entities from raw JSON.',
    example: `const useUserStore = defineStore('users', () => {
  async function load() {
    users.value = await useCases.listUsers()
  }
})`,
    inThisDemo: 'src/presentation/ — the Pinia stores and Vue components you are using right now.',
  },
}

export const ORDER: LayerId[] = ['presentation', 'infrastructure', 'application', 'domain']
