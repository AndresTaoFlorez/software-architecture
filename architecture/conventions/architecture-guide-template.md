# Architecture Guide Template

Use this structure for a new style or presentation pattern. Start each explanation with a situation, show the smallest mechanism, then name it. Follow [CONTRIBUTING](../../CONTRIBUTING.md).

## 1. History and origin

Identify the original design problem and author. Cite the primary source and distinguish later interpretations.

## 2. What problem does it solve?

Describe an actor's requirement and the observable difficulty in a direct implementation.

## 3. When it is a strong fit

Name the change pressures the architecture protects: business rules, integrations and ownership.

## 4. When it is a weak fit

Show when those boundaries cost more than they protect.

## 5. Mental model

Use one compact diagram where relationships need it. Label source dependencies, runtime calls and startup wiring distinctly.

## 6. Layers or roles

For each role, explain its responsibility through the ongoing example. Include one concrete filename, permitted dependencies and a likely placement mistake.

## 7. Physical project structure

Show the generic ownership map. Keep frontend and backend delivery details in their respective routes. Folder names are this handbook's conventions.

## 8. Where does this code go?

Give beginners a usable decision rule. Link [Code Placement](../foundations/code-placement.md) for representation and helper ownership.

## 9. Naming

Apply the [naming convention](naming-and-file-placement.md). Distinguish architectural vocabulary from framework requirements.

## 10. One feature end to end

Give the actor, authoritative business owner, input trust boundary and meaningful failure. Show one rule, operation, justified contract, integration and delivery boundary. Link the canonical example rather than copying an entire stack.

Explain which files change for a new rule, another integration and a consumer in another capability.

## 11. Testing

Explain what domain, operation and integration checks establish. Identify excerpt limits. Temporary author checks are allowed; this repository contains documentation rather than an executable application.

## 12. Trade-offs and failure modes

Describe actual pressure such as duplicated rules, deep imports or an overly broad service. Explain the smallest correction.

## 13. Advanced topics

Add depth only when the architecture question needs it. Adjacent disciplines belong in a complete guide under [extras](../../extras/README.md).

## 14. Learning path

Offer a progressive route. Basic placement and dependency guidance belongs before advanced chapters.

## Sources

Use primary architecture sources and official framework documentation. Mark recommendations and handbook conventions as such.
