# Frontend Architecture References

This section separates primary architectural sources from framework/tool documentation.

## Architecture and boundaries

- **Martin, Robert C.** "The [Clean Architecture](../../GLOSSARY.md#clean-architecture)" (2012). [Dependency Rule](../../GLOSSARY.md#dependency-rule), policies vs. mechanisms, boundary data and the schematic nature of the circles.\
  https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **Martin, Robert C.** *Clean Architecture: A Craftsman's Guide to Software Structure and Design* (2017).
- **Palermo, Jeffrey.** "The [Onion Architecture](../../GLOSSARY.md#onion-architecture)" series (2008). [Domain](../../GLOSSARY.md#domain)-centered layering and inward dependencies.\
  https://jeffreypalermo.com/2008/07/
- **Cockburn, Alistair.** "[Hexagonal Architecture](../../GLOSSARY.md#hexagonal-architecture-ports-and-adapters)" / Ports and Adapters (2005). [Ports](../../GLOSSARY.md#port) as purposeful application conversations and [adapters](../../GLOSSARY.md#adapter) around external actors.\
  https://alistair.cockburn.us/hexagonal-architecture/
- **Seemann, Mark.** "[Composition Root](../../GLOSSARY.md#composition-root)" (2011). Composition at the application entry boundary.\
  https://blog.ploeh.dk/2011/07/28/CompositionRoot/
- **Fowler, Martin.** "[Presentation Model](../../GLOSSARY.md#presentation-model)" (2004). UI state and behavior represented independently of GUI controls.\
  https://martinfowler.com/eaaDev/PresentationModel.html
- **Fowler, Martin.** "GUI Architectures" (2006). [Presentation](../../GLOSSARY.md#presentation-layer) patterns and their trade-offs.\
  https://martinfowler.com/eaaDev/uiArchs.html

## React

- Describing the UI — components and composition.\
  https://react.dev/learn/describing-the-ui
- Reusing Logic with [Custom Hooks](../../GLOSSARY.md#custom-hook).
  https://react.dev/learn/reusing-logic-with-custom-hooks
- Choosing the State Structure.\
  https://react.dev/learn/choosing-the-state-structure
- You Might Not Need an Effect.\
  https://react.dev/learn/you-might-not-need-an-effect
- Synchronizing with Effects.\
  https://react.dev/learn/synchronizing-with-effects
- React Compiler introduction.\
  https://react.dev/learn/react-compiler/introduction

## Redux / Redux Toolkit

- Redux Style Guide. [Feature folders](../../GLOSSARY.md#feature-folder), state ownership, derivation and [reducer](../../GLOSSARY.md#reducer) rules.\
  https://redux.js.org/style-guide/
- Redux FAQ: Code Structure.\
  https://redux.js.org/faq/code-structure/
- Redux: [Side Effects](../../GLOSSARY.md#side-effect) Approaches.\
  https://redux.js.org/usage/side-effects-approaches
- Redux Toolkit: `createAsyncThunk`.\
  https://redux-toolkit.js.org/api/createAsyncThunk
- Redux Toolkit: [Listener Middleware](../../GLOSSARY.md#listener-middleware).\
  https://redux-toolkit.js.org/api/createListenerMiddleware
- Redux Toolkit: [RTK Query](../../GLOSSARY.md#rtk-query) Overview.\
  https://redux-toolkit.js.org/rtk-query/overview

## Panda CSS

- [Recipes](../../GLOSSARY.md#recipe).\
  https://panda-css.com/docs/concepts/recipes
- [Slot Recipes](../../GLOSSARY.md#slot-recipe).\
  https://panda-css.com/docs/concepts/slot-recipes
- Tokens and [Semantic Tokens](../../GLOSSARY.md#semantic-token).\
  https://panda-css.com/docs/theming/tokens
- Text Styles.\
  https://panda-css.com/docs/theming/text-styles
- Writing Styles / Global CSS.\
  https://panda-css.com/docs/concepts/writing-styles
- Animation and keyframes.\
  https://panda-css.com/docs/customization/theme#keyframes

## Module organization

- Redux Style Guide — official feature-folder recommendation.\
  https://redux.js.org/style-guide/
- Feature-Sliced Design — alternative methodology with its own layers, slices and dependency rules; not the canonical structure or a partial taxonomy borrowed here.\
  https://feature-sliced.design/docs/get-started/overview
- Kent C. Dodds, "[Colocation](../../GLOSSARY.md#colocation)" (2019).\
  https://kentcdodds.com/blog/colocation

## Architecture enforcement

- dependency-cruiser, rules reference.\
  https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md

## Platform boundaries

- TypeScript Modules Reference — `paths` changes compiler resolution, not emitted imports.\
  https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths
- Bun Runtime / Module Resolution — default execution, explicit checking and path mappings.\
  https://bun.com/docs/runtime#check\
  https://bun.com/docs/runtime/module-resolution#path-re-mapping
- Node native TypeScript — path-alias limits.\
  https://nodejs.org/docs/latest-v24.x/api/typescript.html#paths-aliases
- MDN, File API. Browser `File` / `FileList` APIs.\
  https://developer.mozilla.org/en-US/docs/Web/API/File_API
