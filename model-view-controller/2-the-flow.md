> **[Model-View-Controller](README.md)** › The Flow. Full reference list: [References](references.md).

## 2. The Flow

The three parts are only useful in motion. This page traces the cycle that connects them, then shows how
the well-known variants — MVP and MVVM — are the *same cycle* with one connection rewired.

---

### 2.1 The classic cycle

In Smalltalk-80 MVC the loop runs like this [Krasner & Pope 1988]:

```
1. User acts          ─►  Controller   (a click, a keystroke)
2. Controller updates ─►  Model        (translates the gesture into a domain operation)
3. Model announces    ─►  "I changed"  (broadcasts to its observers)
4. View observes      ─►  re-reads Model and redraws
```

The crucial detail is step 3–4: the Model does **not** call the View. It emits a change notification, and
the View — which subscribed to the Model — pulls the new state and redraws. This is the **Observer**
pattern doing the synchronization, and it is what lets one Model drive several Views at once without
knowing any of them exist [Gamma et al. 1994].

```
        act              update
  User ────►  Controller ────►  Model
   ▲                              │ notify (observer)
   │ sees                         ▼
  View ◀───────────────────── observes & redraws
```

Because the arrows only ever point one way around the loop, no part needs a back-reference to the part
that drives it. The Model is the still center; the View and Controller revolve around it.

---

### 2.2 Why the Observer link is the hard part

The elegance of classic MVC is also its friction. Wiring every View to observe every relevant Model, and
keeping those subscriptions correct as screens come and go, is tedious and error-prone. Most of MVC's
evolution is a search for a less manual way to keep View and Model in sync — which is exactly what the
variants below automate.

---

### 2.3 The variants: one rewired connection

The differences between MVC, MVP, and MVVM are small and specific. Fowler's "GUI Architectures" is the
canonical map [Fowler]; the summary:

| Pattern | Who updates the View | View ↔ state coupling |
|---|---|---|
| **MVC** (classic) | the View observes the Model directly | View reads the Model |
| **MVP** (Model-View-Presenter) | the Presenter pushes state into a passive View | View is dumb; Presenter drives it |
| **MVVM** (Model-View-ViewModel) | a binding layer syncs View ↔ ViewModel automatically | declarative two-way binding |

- **MVP** [Potel 1996; Fowler]. The Controller grows into a **Presenter** that takes over updating the
  View. The View becomes passive — it exposes setters and events, holds no logic, and is trivial to fake
  in a test. The Presenter, not the View, observes the Model.
- **MVVM** [Gossman 2005; Fowler's "Presentation Model"]. A **ViewModel** holds the View's state in
  display-ready form. A framework binding layer keeps View and ViewModel synchronized automatically, so no
  one writes the observer wiring by hand. This is the lineage modern frontend frameworks descend from —
  see [MVC on the Frontend](3-mvc-on-the-frontend.md).

All three keep the same Model and the same separated-presentation principle. They differ only in how step
3–4 of the cycle — getting a Model change onto the screen — is accomplished.

---

### 2.4 Server-side "MVC" is a different animal

When Rails or Spring say "MVC," the cycle is not the one above. There is no long-lived View observing a
Model in the user's session; instead a Controller handles a request, builds a Model, and renders a View
(an HTML template) once per response [Fowler]. The names are borrowed, but the observer synchronization —
the heart of client-side MVC — is absent. Keep the two mental models separate, or the word "Controller"
will mean two incompatible things in the same conversation.

---

Next: **[MVC on the Frontend](3-mvc-on-the-frontend.md)** — why a Vue or React component is closer to
MVVM than to classic MVC, and how to keep the separation honest anyway.
