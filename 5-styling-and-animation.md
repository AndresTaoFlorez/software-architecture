# Styling & Animation Architecture — *Presentation*

> A companion to the [Onion Architecture for the Frontend](README.md) guide. This is a **Presentation-layer**
> concern, extracted into its own document so the core guide stays focused on the four layers. It expands on
> the §7 convention of keeping structural styles out of component markup
> ([Naming & Conventions](README.md#7-naming--conventions-portable-defaults)) and pairs with feature-based
> component organization ([§8.5](3-advanced-patterns.md#85-feature-based-component-organization--presentation)).

Where should a component's styles and its imperative animations (a GSAP timeline, a scroll trigger, an
anime.js sequence) live? Two arrangements are recommended. Both share one goal — a component's visual
concerns are **findable and movable as a unit** — and differ only in *where* the files sit.

**What counts as a "styling concern" here.** A component's scoped CSS or CSS Module, plus any animation
script that exists *only to give the component shape, motion, or visual behavior*. These are Presentation
details that decorate a component without being part of its logic; the component **imports** them rather
than inlining them. This extends the convention of keeping structural styles out of component markup to
also cover animation code.

## Approach A — a mirrored `styles/` tree

The `styles/` folder mirrors the shape of `components/`, holding the CSS and animation files that correspond
to each component:

```
presentation/
├── components/
│   └── auth/
│       ├── LoginForm.vue        # imports its style/animation by absolute path
│       └── SignupForm.vue
└── styles/
    └── auth/
        ├── LoginForm.css
        ├── LoginForm.gsap.js
        ├── SignupForm.css
        └── SignupForm.gsap.js
```

```js
// presentation/components/auth/LoginForm.vue  (script)
import '@/presentation/styles/auth/LoginForm.css'
import { playEntrance } from '@/presentation/styles/auth/LoginForm.gsap.js'
```

*When it fits.* A dedicated design or motion owner who works across the visual layer without touching
component logic; a wish to see "all the styling" gathered in one place; or a shared design-token system that
already lives under `styles/`. The cost: a component and its appearance sit in two trees, so moving or
deleting a feature means editing both.

## Approach B — colocation inside the feature folder

The CSS and animation files sit *next to* the component that owns them:

```
presentation/
└── components/
    └── auth/
        ├── LoginForm.vue
        ├── LoginForm.css
        ├── LoginForm.gsap.js
        ├── SignupForm.vue
        └── SignupForm.css
```

```js
// presentation/components/auth/LoginForm.vue  (script)
import './LoginForm.css'
import { playEntrance } from './LoginForm.gsap.js'
```

*When it fits.* Most application work. The component and everything that gives it form travel as one unit:
move the folder and nothing breaks; delete the feature and no orphaned CSS is left behind. This is the
colocation principle applied to styling — "place code as close to where it's relevant as possible"
[Dodds 2019] — and it pairs naturally with the feature folders of
[§8.5](3-advanced-patterns.md#85-feature-based-component-organization--presentation).

## Choosing

Default to **Approach B (colocation)**; it has the fewest moving parts and the strongest "things that change
together live together" property. Reach for **Approach A (mirror)** when an organizational reason — a separate
styling owner, a shared token pipeline, a design system — makes a standalone visual tree worth its
coordination cost. Either way two rules hold: the component *imports* its styles and animations rather than
embedding them, and the chosen layout is applied consistently so a reader always knows where a component's
appearance lives. Vue's single-file components also support `<style scoped>` and `<style module>` for styles
small and intrinsic enough to stay in the file; the external-file approaches above are for when styling and
animation grow beyond what comfortably belongs inline [Vue SFC docs; GSAP docs].

## References

- **Dodds, K. C.** (2019). *Colocation*. (Place code as close as possible to where it is relevant.)
  https://kentcdodds.com/blog/colocation
- **GreenSock (GSAP).** *GSAP Documentation.* (Imperative, timeline-based animation.) https://gsap.com/docs/
- **Vue.js.** *SFC CSS Features.* (`<style scoped>` and `<style module>`.)
  https://vuejs.org/api/sfc-css-features.html
