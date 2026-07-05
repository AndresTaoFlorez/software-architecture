# Model-View-ViewModel for the Frontend

> The pattern modern component frameworks actually implement. MVVM separates what the app *knows*
> (Model), what the user *sees* (View), and the display-ready state that stands between them
> (ViewModel) — synchronized by the framework's binding instead of hand-written observers. Every
> prescriptive claim is tied to a source in [References](references.md).

← Back to [architecture overview](../README.md) · See also the [MVC](../model-view-controller), [Clean](../clean-architecture) and [Onion](../onion-architecture) guides

---

## Read This First: MVVM Is MVC's Direct Descendant

Like MVC, MVVM organizes the **presentation tier alone** — it says nothing about repositories,
transports, or where business rules live, so it is **complementary to Clean and Onion, not competing**
with them. What distinguishes it from classic MVC is one substitution: the hand-wired Observer that
kept View and Model in sync is replaced by a **declarative binding layer** that a framework provides
[Gossman 2005; Fowler, GUI Architectures].

That substitution is why this guide matters today: a Vue, React, or Svelte component — reactive state
bound into a template, re-rendered automatically on change — is already MVVM whether its author knows
it or not. The [MVC guide](../model-view-controller/3-mvc-on-the-frontend.md) makes that argument;
this guide describes the pattern on its own terms.

---

## Contents

- **[1 · The Three Parts](1-the-three-parts.md)** — Model, View, ViewModel, and where the Controller went
- **[2 · The Binding](2-the-binding.md)** — how automatic synchronization replaces the observer, and what it costs
- **[3 · MVVM on the Frontend](3-mvvm-on-the-frontend.md)** — stores, hooks, and composables as ViewModels; the fat-ViewModel failure mode; MVVM inside Clean and Onion; the pattern at Microsoft, Google, Airbnb, and Vue
- **[4 · Testing in MVVM](4-testing-in-mvvm.md)** — the headless ViewModel test, the pattern's original justification
- **[References](references.md)** — every cited source

---

## The Triad in One Picture

```
 ┌──────────────┐    binding (automatic)     ┌───────────────┐    calls     ┌─────────────┐
 │     View     │ ◀────────────────────────▶ │   ViewModel   │ ───────────▶ │    Model    │
 │  template +  │    the framework keeps     │ display state │              │ data + rules│
 │    render    │    both sides in sync      │  + commands   │              │  UI-agnostic│
 └──────────────┘                            └───────────────┘              └─────────────┘
        ▲                                           ▲
        │ sees                                      │ never references the View
      ┌─────┐                                       │
      │User │ ── gestures land on bindings that invoke ViewModel commands
      └─────┘
```

- **Model** — the data and the rules that govern it, ignorant of any screen. Identical in spirit to
  MVC's Model, Clean's Entities, and Onion's Domain.
- **ViewModel** — in Gossman's words, the "Model of a View": display-ready values, and commands
  that interpret user intent. It holds **no reference to the View** [Gossman 2005; Fowler 2004].
- **View** — a declarative template bound to the ViewModel. It renders what the ViewModel exposes and
  routes gestures to its commands; ideally it contains no logic at all.

The defining property is inherited from MVC: **separated presentation** [Fowler]. What MVVM adds is
that the synchronization — MVC's hardest, most error-prone part — is done by the framework.

---

## A Warning About the Word "ViewModel"

"ViewModel" names two materially different things. In server-side MVC (ASP.NET, Rails presenters) a
"view model" is a **passive DTO** — a bag of fields shaped for one template, created per request and
discarded. In MVVM the ViewModel is a **live, stateful object** that outlasts renders, exposes
commands, and participates in binding [Gossman 2005; Smith 2009]. This guide always means the second.
When reading elsewhere, check which one the author means before transferring any advice.

---

## Where to Start

Read **[The Three Parts](1-the-three-parts.md)** for the responsibilities — especially what the
ViewModel must never do. Then **[The Binding](2-the-binding.md)** shows the cycle that replaces MVC's
observer loop, **[MVVM on the Frontend](3-mvvm-on-the-frontend.md)** maps the pattern onto today's
stores and hooks and onto Clean/Onion layering, and **[Testing](4-testing-in-mvvm.md)** shows the
dividend that motivated the pattern in the first place.
