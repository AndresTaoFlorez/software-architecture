> **[Clean Architecture](README.md)** › Evolution & Scaling.

<a id="7-scaling-startup-to-enterprise"></a>

<a id="7-evolution-and-scaling"></a>

# Evolution and Scaling

[Clean Architecture](../../../GLOSSARY.md#clean-architecture) does not define startup, scale-up or enterprise phases, and it does not prescribe team-size thresholds for architectural mechanisms.

The durable rule remains inward dependency direction. How modules are grouped, composed and deployed may evolve.

The canonical guidance is now centralized in:

**[Architecture Evolution and Scaling](../../foundations/evolution-and-scaling.md)**

<a id="71-the-four-growth-phases"></a>

<a id="73-the-scaling-decision-tree"></a>

<a id="74-red-flags"></a>

## Clean-specific notes

### Keep policy boundaries while changing physical structure

The same use-case boundary can live in:

```mermaid
%%{init: {"htmlLabels": false, "flowchart": {"htmlLabels": false, "nodeSpacing": 28, "rankSpacing": 48, "diagramPadding": 20, "wrappingWidth": 280}, "sequence": {"wrap": true, "diagramMarginX": 20, "diagramMarginY": 20}}}%%
flowchart LR
    A["One package"] --> B["Module inside a monolith"] --> C["Separate package"] --> D["Independently deployed service"]
```

Moving it across a process boundary is a deployment decision, not proof of better [Clean Architecture](../../../GLOSSARY.md#clean-architecture).

<a id="72-what-does-not-change"></a>

### Feature ownership does not require duplicating four circles per feature

Avoid mechanically creating:

```mermaid
%%{init: {"htmlLabels": false, "flowchart": {"htmlLabels": false, "nodeSpacing": 28, "rankSpacing": 48, "diagramPadding": 20, "wrappingWidth": 280}, "sequence": {"wrap": true, "diagramMarginX": 20, "diagramMarginY": 20}}}%%
flowchart TD
    N0["feature/"]
    N1["entities/"]
    N2["usecases/"]
    N3["adapters/"]
    N4["frameworks/"]
    N0 --> N1
    N0 --> N2
    N0 --> N3
    N0 --> N4
```

for every small feature.

Prefer the smallest structure that preserves meaningful boundaries.

### DI containers are optional

A larger organization does not automatically imply a [DI container](../../../GLOSSARY.md#di-container). Adopt one for object-graph/lifetime/framework reasons, not a headcount milestone.


### Microservices and microfrontends are not "final phases"

They solve distribution and organizational autonomy problems and introduce substantial operational cost.

Use observable forces, not maturity-stage diagrams.

## Sources

- Robert C. Martin, "The [Clean Architecture](../../../GLOSSARY.md#clean-architecture)": https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- Martin Fowler, "Monolith First": https://martinfowler.com/bliki/MonolithFirst.html
- Cam Jackson, "Micro Frontends": https://martinfowler.com/articles/micro-frontends.html
