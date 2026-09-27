# Frontend Architecture References

This section separates primary architectural sources from framework/tool documentation.

## Architecture and boundaries

- **Martin, Robert C.** "The Clean Architecture" (2012). Dependency Rule, policies vs. mechanisms, boundary data and the schematic nature of the circles.  
  https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **Martin, Robert C.** *Clean Architecture: A Craftsman's Guide to Software Structure and Design* (2017).
- **Palermo, Jeffrey.** "The Onion Architecture" series (2008). Domain-centered layering and inward dependencies.  
  https://jeffreypalermo.com/2008/07/
- **Cockburn, Alistair.** "Hexagonal Architecture" / Ports and Adapters (2005). Ports as purposeful application conversations and adapters around external actors.  
  https://alistair.cockburn.us/hexagonal-architecture/
- **Seemann, Mark.** "Composition Root" (2011). Composition at the application entry boundary.  
  https://blog.ploeh.dk/2011/07/28/CompositionRoot/
- **Fowler, Martin.** "Presentation Model" (2004). UI state and behavior represented independently of GUI controls.  
  https://martinfowler.com/eaaDev/PresentationModel.html
- **Fowler, Martin.** "GUI Architectures" (2006). Presentation patterns and their trade-offs.  
  https://martinfowler.com/eaaDev/uiArchs.html

## React

- Reusing Logic with Custom Hooks.  
  https://react.dev/learn/reusing-logic-with-custom-hooks
- Choosing the State Structure.  
  https://react.dev/learn/choosing-the-state-structure
- You Might Not Need an Effect.  
  https://react.dev/learn/you-might-not-need-an-effect
- Synchronizing with Effects.  
  https://react.dev/learn/synchronizing-with-effects
- React Compiler introduction.  
  https://react.dev/learn/react-compiler/introduction

## Redux / Redux Toolkit

- Redux Style Guide. Feature folders, state ownership, derivation and reducer rules.  
  https://redux.js.org/style-guide/
- Redux FAQ: Code Structure.  
  https://redux.js.org/faq/code-structure/
- Redux: Side Effects Approaches.  
  https://redux.js.org/usage/side-effects-approaches
- Redux Toolkit: `createAsyncThunk`.  
  https://redux-toolkit.js.org/api/createAsyncThunk
- Redux Toolkit: Listener Middleware.  
  https://redux-toolkit.js.org/api/createListenerMiddleware
- Redux Toolkit: RTK Query Overview.  
  https://redux-toolkit.js.org/rtk-query/overview

## Panda CSS

- Recipes.  
  https://panda-css.com/docs/concepts/recipes
- Slot Recipes.  
  https://panda-css.com/docs/concepts/slot-recipes
- Tokens and Semantic Tokens.  
  https://panda-css.com/docs/theming/tokens
- Text Styles.  
  https://panda-css.com/docs/theming/text-styles
- Writing Styles / Global CSS.  
  https://panda-css.com/docs/concepts/writing-styles
- Animation and keyframes.  
  https://panda-css.com/docs/customization/theme#keyframes

## Module organization

- Redux Style Guide — official feature-folder recommendation.  
  https://redux.js.org/style-guide/
- Feature-Sliced Design — slices/segments and public API concepts. Used here as a secondary organizational reference, **not** as a mandatory architecture for this repository.  
  https://feature-sliced.design/docs/reference/slices-segments  
  https://feature-sliced.design/docs/reference/public-api
- Kent C. Dodds, "Colocation" (2019).  
  https://kentcdodds.com/blog/colocation

## Architecture enforcement

- dependency-cruiser, rules reference.  
  https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md

## Platform boundaries

- MDN, File API. Browser `File` / `FileList` APIs.  
  https://developer.mozilla.org/en-US/docs/Web/API/File_API
