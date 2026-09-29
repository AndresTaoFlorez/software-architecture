> **[Model-View-ViewModel](README.md)** › The Three Parts. Full reference list: [References](references.md).

## 1. The Three Parts

Consider an Orders screen. The user clicks **Cancel**, the button is disabled during saving, and an error message appears if saving fails. The part that draws the button does not have to decide what `isSaving` or `errorMessage` should be. A separate [ViewModel](../GLOSSARY.md#viewmodel) can expose those values and a `cancel()` operation; the [View](../GLOSSARY.md#view) displays them and forwards the click. The underlying [Model](../GLOSSARY.md#model) supplies the order information and cancellation behavior needed by that screen.

John Gossman's 2005 WPF formulation names this screen-oriented part a model of the view. Fowler's earlier [Presentation Model](../GLOSSARY.md#presentation-model) describes a related approach. Both separate screen state/behavior from concrete controls; [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) also draws on declarative binding. This relationship does not make every reactive framework an [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) application.

### 1.1 Model

The [Model](../GLOSSARY.md#model) supplies the non-view capabilities/state the [ViewModel](../GLOSSARY.md#viewmodel) works with. In a layered application, these may be [Application](../GLOSSARY.md#application-layer) operations, [Domain](../GLOSSARY.md#domain) objects or results. The role is broader than a folder named `domain/` or the [Clean Entities](../GLOSSARY.md#clean-entities-circle) circle.

The [Model](../GLOSSARY.md#model) does not depend on concrete screens. It may expose change notifications when other actors change its state; [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) does not forbid observability. Authoritative business rules stay here or further inward, rather than in display derivations.

### 1.2 View

The [View](../GLOSSARY.md#view) renders values and forwards user intent through the [ViewModel](../GLOSSARY.md#viewmodel) contract. It owns visual details such as layout, focus, hover and animation. Local visual state is allowed; state whose meaning must survive replacing the controls belongs outside those controls.

A declarative template can bind to values and commands. It still needs tests for the correct binding, event arguments and accessibility. [MVVM](../GLOSSARY.md#model-view-viewmodel-mvvm) is not synonymous with Fowler's [Passive View](../GLOSSARY.md#passive-view): binding to a [ViewModel](../GLOSSARY.md#viewmodel) is a different arrangement from an externally driven view interface.

### 1.3 ViewModel

The [ViewModel](../GLOSSARY.md#viewmodel) owns display-ready state, derived values, pending/error feedback and view commands. It does not reference concrete controls and does not implement HTTP/database clients or authoritative business [invariants](../GLOSSARY.md#invariant).

This complete framework-neutral core receives an application capability; a separate binding observes it:

```js
// presentation/orders/CancelOrderViewModel.js
export class CancelOrderViewModel {
  busy = false
  message = ''
  #cancelOrder
  #listeners = new Set()
  constructor(cancelOrder) { this.#cancelOrder = cancelOrder }
  subscribe(listener) {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }
  #changed() { for (const listener of this.#listeners) listener() }
  async cancel(id) {
    if (this.busy) return
    this.busy = true; this.message = ''; this.#changed()
    try {
      const result = await this.#cancelOrder(id)
      this.message = result.ok ? 'Cancelled' : `Cannot cancel: ${result.reason}`
    } catch {
      this.message = 'Unexpected failure'
    } finally {
      this.busy = false; this.#changed()
    }
  }
}
```

`cancelOrder` has the application contract from [the complete feature](../clean-architecture/4-building-a-feature.md). State and command outcomes are testable without a DOM. A binding must subscribe, render the initial state and unsubscribe; mutating this class does not magically rerender React.

WPF [ViewModels](../GLOSSARY.md#viewmodel) may use `ICommand` and notification contracts; independence from concrete controls does not mean total UI-toolkit independence. A React [custom Hook](../GLOSSARY.md#custom-hook) may intentionally own the same presentation role while depending on React and needing a React test harness.

### 1.4 Where did the Controller go?

In the WPF formulation, controls handle device interaction and [ViewModel](../GLOSSARY.md#viewmodel) commands handle semantic intent. This is a shift in responsibility, not a universal historical claim that every [Controller](../GLOSSARY.md#controller) was renamed. [MVC](../GLOSSARY.md#model-view-controller-mvc) variants and server [MVC](../GLOSSARY.md#model-view-controller-mvc) use different arrangements.

### 1.5 The one rule that holds it together

Keep the [Model](../GLOSSARY.md#model) independent of concrete [View](../GLOSSARY.md#view) controls, put screen-oriented state/commands in the [ViewModel](../GLOSSARY.md#viewmodel), and have the [View](../GLOSSARY.md#view) consume that contract. Clean/Onion separately constrain where underlying application and domain policy lives.

Next: **[The Binding](2-the-binding.md)** — synchronization, ownership and lifetime.

## Sources

- [Gossman — Introduction to Model/View/ViewModel (2005)](https://learn.microsoft.com/en-us/archive/blogs/johngossman/introduction-to-modelviewviewmodel-pattern-for-building-wpf-apps)
- [Fowler — Presentation Model (2004)](https://martinfowler.com/eaaDev/PresentationModel.html)
- [Smith — WPF Apps With MVVM (2009)](https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/february/patterns-wpf-apps-with-the-model-view-viewmodel-design-pattern)
