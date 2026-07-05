# Model-View-Controller for the Frontend

> The oldest UI pattern still in daily use. MVC separates what the app *knows* (Model), what the user
> *sees* (View), and what turns input into change (Controller). Every prescriptive claim is tied to a
> source in [References](references.md).

← Back to [architecture overview](../README.md) · See also the [MVVM](../model-view-viewmodel), [Clean](../clean-architecture) and [Onion](../onion-architecture) guides

---

## Read This First: MVC Is a Different Kind of Thing

Clean and Onion are **whole-application** architectures: they organize every layer of a system by the
direction of its dependencies. MVC is **not** that. MVC organizes the **presentation tier alone** — it
says nothing about repositories, transports, or where business rules live.

That makes the three patterns **complementary, not competing.** MVC (or its descendants MVP and MVVM)
describes how a screen is wired; Clean and Onion describe where that screen sits in the larger system. A
well-built app commonly uses MVC-style separation *inside* the outer ring of an Onion or Clean design
[Fowler, GUI Architectures]. Treat this guide as "how to organize the View layer," not "an alternative to
the other two."

---

## Contents

- **[1 · The Three Parts](1-the-three-parts.md)** — Model, View, Controller, and what each must not do
- **[2 · The Flow](2-the-flow.md)** — the input → update → render cycle, and the observer that closes it
- **[3 · MVC on the Frontend](3-mvc-on-the-frontend.md)** — why modern frameworks are really MVVM, and how to keep MVC honest
- **[4 · Testing in MVC](4-testing-in-mvc.md)** — testing the Model directly and the seam at the Controller
- **[References](references.md)** — every cited source

---

## The Triad in One Picture

```
            ┌──────────────┐
   sees     │     View     │   renders the Model; forwards user gestures
  ┌────────▶│              │──────────────┐
  │         └──────────────┘              │ user acts
  │                ▲                       ▼
┌─────┐            │ notifies      ┌──────────────┐
│User │            │ (observer)    │  Controller  │   interprets input
└─────┘            │               └──────────────┘
  ▲                │                       │ updates
  │         ┌──────────────┐               │
  └─────────│    Model     │◀──────────────┘
            │              │   holds data + rules; knows nothing of the UI
            └──────────────┘
```

- **Model** — the data and the rules that govern it. In classic MVC the Model is UI-agnostic: it does not
  know the View or the Controller exist. It announces changes; it does not push them to a specific screen.
- **View** — the visual representation of the Model. It observes the Model and redraws when notified.
- **Controller** — interprets user input (a click, a keystroke, a route change) and turns it into
  operations on the Model.

The defining property is **separated presentation** [Fowler]: domain state lives in the Model, isolated
from how it is displayed, so the same Model can drive different Views and be tested with no UI at all.

---

## A Warning About the Acronym

"MVC" is the most overloaded term in software architecture. Smalltalk-80 MVC, server-side MVC (Rails,
Spring), and the "MVC" marketed by early JavaScript frameworks are three materially different things
[Fowler]. This guide describes the **classic, client-side** pattern and its direct descendants (MVP,
MVVM). Where a distinction matters, it is named explicitly — start with [The Flow](2-the-flow.md) to see
where the variants diverge.

---

## Where to Start

Read **[The Three Parts](1-the-three-parts.md)** for the responsibilities, then **[The Flow](2-the-flow.md)**
for how they interact. **[MVC on the Frontend](3-mvc-on-the-frontend.md)** translates all of it to today's
component frameworks, where the honest label is usually MVVM.
