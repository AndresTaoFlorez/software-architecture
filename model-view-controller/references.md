> **[Model-View-Controller](README.md)** › References.

## References

The sources most central to MVC and its variants are marked ★.

- ★ **Reenskaug, T.** (1979). *Models–Views–Controllers* (and *Thing-Model-View-Editor*). Xerox PARC
  technical notes. (The original formulation of MVC.)
  https://folk.universitetetioslo.no/trygver/themes/mvc/mvc-index.html
- ★ **Krasner, G. E., & Pope, S. T.** (1988). *A Cookbook for Using the Model-View-Controller User
  Interface Paradigm in Smalltalk-80*. Journal of Object-Oriented Programming, 1(3). (The canonical
  description of classic MVC and its observer synchronization.)
- ★ **Fowler, M.** *GUI Architectures*. martinfowler.com. (The definitive modern map of MVC, MVP, MVVM,
  Passive View, Supervising Controller, and Presentation Model — and why "MVC" means several different
  things.) https://martinfowler.com/eaaDev/uiArchs.html
- **Gamma, E., Helm, R., Johnson, R., & Vlissides, J.** (1994). *Design Patterns: Elements of Reusable
  Object-Oriented Software*. Addison-Wesley. (MVC as a compound of Observer, Strategy, and Composite.)
- **Potel, M.** (1996). *MVP: Model-View-Presenter — The Taligent Programming Model for C++ and Java*.
  Taligent Inc.
- **Gossman, J.** (2005). *Introduction to Model/View/ViewModel pattern for building WPF apps*. Microsoft
  Developer Blogs. (The origin of MVVM.)
- **Fowler, M.** (2004). *Presentation Model*. martinfowler.com. (The pattern MVVM is based on.)
  https://martinfowler.com/eaaDev/PresentationModel.html
- **Vue.js & Pinia documentation.** https://vuejs.org/ · https://pinia.vuejs.org/ (Reactive binding and
  stores — the framework machinery that automates MVC's observer step into MVVM.)

For MVC's direct descendant — the pattern component frameworks actually implement — see the
companion **[MVVM guide](../model-view-viewmodel)**. For the whole-application architectures this
pattern fits inside, see the **[Clean](../clean-architecture)** and **[Onion](../onion-architecture)**
guides.
