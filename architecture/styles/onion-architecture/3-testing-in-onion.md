> [Onion Architecture](README.md) › Testing the Rings.

<a id="5-testing-the-layers"></a>
<a id="54-per-layer-testing"></a>
<a id="57-justification"></a>
<a id="5-testing-the-rings"></a>
<a id="51-tests-are-an-outer-ring"></a>

<a id="3-testing-the-rings"></a>

# Testing the Rings

A shipped order rejects cancellation even when no screen or database exists. Check this business behavior directly, then check the surrounding workflow and integrations. Use the [canonical cancellation example](../clean-architecture/4-building-a-feature.md).

**Contents**

- [Domain tests](#domain-tests)
- [Application tests](#application-tests)
- [Infrastructure adapter tests](#infrastructure-adapter-tests)
- [Presentation tests](#presentation-tests)
- [Contract tests for ports/adapters](#contract-tests-for-portsadapters)
- [Architecture tests](#architecture-tests)
- [Test placement](#test-placement)
- [Test doubles by purpose](#test-doubles-by-purpose)
- [Choose checks by risk](#choose-checks-by-risk)
- [Sources](#sources)

<a id="domain-substitute-nothing"></a>
<a id="51-domain-tests"></a>

<a id="31-domain-tests"></a>

## Domain tests

Construct `Order` in relevant states and observe `cancel()`. [Domain](../../../GLOSSARY.md#domain) checks require no substitute for a framework.

<a id="52-application-tests"></a>
<a id="application-substitute-the-port"></a>

<a id="32-application-tests"></a>

## Application tests

Supply `CancelOrder` with a small repository. Observe loading and saving successful cancellation, and no saving after rejection. A memory substitute establishes workflow behavior rather than a real integration.

<a id="53-infrastructure-adapter-tests"></a>
<a id="infrastructure-substitute-the-transport-keep-the-mapping-real"></a>

<a id="33-infrastructure-adapter-tests"></a>

## Infrastructure adapter tests

Check the actual implementation's mapping and external behavior. Keep the mapper real when its translation is what the check is meant to establish.

<a id="54-presentation-tests"></a>
<a id="presentation-substitute-the-use-case"></a>

<a id="34-presentation-tests"></a>

## Presentation tests

Supply a controlled [Application](../../../GLOSSARY.md#application-layer) operation and observe user intent and feedback. A full application journey separately checks the assembled system.

<a id="55-contract-tests-for-portsadapters"></a>

<a id="35-contract-tests-for-portsadapters"></a>

## Contract tests for ports/adapters

Several implementations can share checks of an agreed contract: save a cancelled order, then load its state. Run those checks against each actual implementation; identical method signatures alone do not establish equivalent behavior.

<a id="56-architecture-tests"></a>

<a id="36-architecture-tests"></a>

## Architecture tests

Check source direction and capability entry points independently of behavior. See [Checking Architectural Boundaries](../../foundations/architecture-testing.md).

<a id="57-test-placement"></a>
<a id="56-where-tests-live"></a>

<a id="37-test-placement"></a>

## Test placement

Colocate focused checks such as `Order.test.ts` with their owner. [Application](../../../GLOSSARY.md#application-layer) projects may use a dedicated integration directory for shared external setup.

<a id="58-test-doubles-by-purpose"></a>
<a id="52-a-vocabulary-for-substitutes"></a>
<a id="55-what-each-layers-tests-substitute"></a>

<a id="38-test-doubles-by-purpose"></a>

## Test doubles by purpose

| Substitute | Purpose |
| --- | --- |
| Stub | Return controlled values |
| Spy | Record interactions |
| Fake | Provide a lightweight working implementation |
| Mock | Verify expected collaboration |

Choose the smallest substitute that establishes the intended observation.

<a id="53-the-test-pyramid-mapped-onto-the-onion"></a>
<a id="59-the-pyramid-is-not-a-quota"></a>

<a id="39-choose-checks-by-risk"></a>

## Choose checks by risk

Use focused checks for rules, integration checks for mapping and external behavior, and end-to-end checks for critical journeys. Fixed percentages do not establish coverage.

## Sources

- [Fowler: Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)
- [Vocke: The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
