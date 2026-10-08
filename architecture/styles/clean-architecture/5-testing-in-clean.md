> [Clean Architecture](README.md) › Testing.

<a id="5-testing-in-clean-architecture"></a>

# Testing in Clean Architecture

An order in `shipped` state must reject cancellation. Check that rule directly before checking screens or storage. The [canonical cancellation example](4-building-a-feature.md) gives the model and operation.

**Contents**

- [Test the business decision](#test-the-business-decision)
- [Test the workflow](#test-the-workflow)
- [Test the integration](#test-the-integration)
- [Test delivery and dependencies](#test-delivery-and-dependencies)
- [Sources](#sources)

<a id="51-test-the-business-decision"></a>

## Test the business decision

A domain check creates an `Order` in each relevant state, calls `cancel()` and observes either `cancelled` or the expected rejection. This establishes rule behavior independently of UI and persistence.

<a id="52-test-the-workflow"></a>

## Test the workflow

Supply `CancelOrder` with a small repository substitute. Check that it loads the requested order, saves a successful cancellation, and avoids saving when the rule rejects it or the order is absent.

These checks establish orchestration. They do not establish that a real database implementation works.

<a id="53-test-the-integration"></a>

## Test the integration

Run the concrete repository against its intended external system in an application project. Check field mapping, loading and failure behavior. The handbook's memory example only establishes process-local behavior.

<a id="54-test-delivery-and-dependencies"></a>

## Test delivery and dependencies

| Check | Evidence |
| --- | --- |
| Delivery | User intent invokes the operation and displays its outcome |
| Source boundaries | Inner policy avoids framework and concrete integration imports |
| End-to-end | The assembled application's actual user path works |

Review dependency rules separately from business behavior. See [Checking Architectural Boundaries](../../foundations/architecture-testing.md).

## Sources

- [Martin: Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Fowler: Test Double](https://martinfowler.com/bliki/TestDouble.html)
