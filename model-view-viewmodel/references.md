> **[Model-View-ViewModel](README.md)** › References.

## References

The sources most central to MVVM are marked ★. All URLs verified reachable as of 2026-07-05.

### Primary sources

- ★ **Gossman, J.** (2005-10-08). *Introduction to Model/View/ViewModel pattern for building WPF
  apps*. Microsoft Developer Blogs (archived on Microsoft Learn). (The origin of MVVM: "The term
  means 'Model of a View'"; the View "almost always defined declaratively"; the Controller "just
  faded into the background.")
  https://learn.microsoft.com/en-us/archive/blogs/johngossman/introduction-to-modelviewviewmodel-pattern-for-building-wpf-apps
- ★ **Gossman, J.** (2006-03-04). *Advantages and disadvantages of M-V-VM*. Microsoft Developer
  Blogs (archived on Microsoft Learn). (The testability motivation stated by the author — "you can
  test it without awkward UI automation and interaction" — and the honest cost list: overkill for
  simple UI, binding harder to debug, binding bookkeeping overhead.)
  https://learn.microsoft.com/en-us/archive/blogs/johngossman/advantages-and-disadvantages-of-m-v-vm
- ★ **Fowler, M.** (2004). *Presentation Model*. martinfowler.com. (The pattern MVVM specializes:
  "a fully self-contained class that represents all the data and behavior of the UI window, but
  without any of the controls used to render that UI on the screen.")
  https://martinfowler.com/eaaDev/PresentationModel.html
- ★ **Fowler, M.** *GUI Architectures*. martinfowler.com. (The definitive map of MVC, MVP, MVVM,
  Passive View, and Presentation Model — and where the Controller's responsibilities went.)
  https://martinfowler.com/eaaDev/uiArchs.html
- **Smith, J.** (2009). *Patterns — WPF Apps With The Model-View-ViewModel Design Pattern*. MSDN
  Magazine, February 2009 (archived on Microsoft Learn). (The canonical worked treatment: commands,
  binding discipline, and the headless ViewModel test — "Views and unit tests are just two
  different types of ViewModel consumers.")
  https://learn.microsoft.com/en-us/archive/msdn-magazine/2009/february/patterns-wpf-apps-with-the-model-view-viewmodel-design-pattern

### Ancestry

- **Krasner, G. E., & Pope, S. T.** (1988). *A Cookbook for Using the Model-View-Controller User
  Interface Paradigm in Smalltalk-80*. Journal of Object-Oriented Programming, 1(3). (The ancestor
  pattern and the observer synchronization MVVM automates.)
- **Gamma, E., Helm, R., Johnson, R., & Vlissides, J.** (1994). *Design Patterns: Elements of
  Reusable Object-Oriented Software*. Addison-Wesley. (The Observer pattern — the manual mechanism
  binding layers replaced.)

### The pattern in industry (cited in [§3.4](3-mvvm-on-the-frontend.md#34-the-pattern-in-the-wild))

- **Microsoft.** *The Model-View-ViewModel Pattern*, in **Enterprise Application Patterns Using
  .NET MAUI**. Microsoft Learn. ("The view model is unaware of the view"; "don't reference view
  types … from view models.") https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm
- **Google.** *Guide to App Architecture*. Android Developers. (UI layer split into UI elements and
  "state holders (such as ViewModel)"; unidirectional data flow.)
  https://developer.android.com/topic/architecture
- **Airbnb.** *Mavericks* (formerly MvRx). ("The Android framework from Airbnb that we use for
  nearly all product development at Airbnb.") https://github.com/airbnb/mavericks
- **Vue.js.** *The Vue Instance*, Vue 2 Guide. ("Vue's design was partly inspired by [MVVM]. As a
  convention, we often use the variable `vm` (short for ViewModel) to refer to our Vue instance.")
  https://v2.vuejs.org/v2/guide/instance.html
- **React documentation.** https://react.dev/ (One-way data flow and hooks — the narrowed-write-path
  end of the binding dial discussed in [The Binding §2.3](2-the-binding.md).)

For the ancestor pattern, see the companion **[MVC guide](../model-view-controller)**. For the
whole-application architectures this pattern fits inside, see the
**[Clean](../clean-architecture)** and **[Onion](../onion-architecture)** guides.
