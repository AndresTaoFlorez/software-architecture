# Interface Styles and Events

The EPS scheduling screen needs immediate confirmation of a booking. A reminder service can learn about that booking later. These consumers have different timing and data needs, so one transport shape need not serve both.

Read [Resources and Operations](resources-and-operations.md) and [Reliability, Evolution and Operations](reliability-and-operations.md) first. This chapter compares interface choices; each choice still needs authorization, contracts and failure handling.

**Contents**

- [Choose by consumer interaction](#choose-by-consumer-interaction)
- [Deliver a booking event](#deliver-a-booking-event)
- [Gateways, BFFs and service ownership](#gateways-bffs-and-service-ownership)

## Choose by consumer interaction

| Interface | Strong fit in the care network | Cost and boundary |
| --- | --- | --- |
| HTTP resource API | Scheduling coordinator reads physicians and site agendas, then books or edits appointments | Client may need several requests for a complex screen; resource contract must stay stable |
| GraphQL | Several UIs need different combinations of organization-owned fields in one query | Resolver authorization, query depth/cost, caching and schema evolution need explicit policy |
| gRPC | Trusted internal services need typed RPCs, streaming or efficient service-to-service calls | Protobuf and transport tooling shape clients; browser access often needs another edge |
| Event or webhook | Reminder system reacts after booking without blocking the scheduling coordinator | Delivery is delayed and may repeat or arrive out of order |

[GraphQL's specification](https://spec.graphql.org/) defines a typed query language and execution model; its [official learning guide](https://graphql.org/learn/queries/) explains client-selected fields. It does not remove object- and field-level authorization. [gRPC's official introduction](https://grpc.io/docs/what-is-grpc/introduction/) explains service definitions, Protocol Buffers and call types. Neither is universally faster or simpler for this organization. Measure consumer needs before adding a second public interface.

The booking command stays synchronous while the caller needs an immediate accepted or rejected slot. A historical import can use an HTTP job resource with `202`, as [the resource chapter](resources-and-operations.md#bulk-and-long-running-work) describes. A real-time agenda screen may later use server-sent events or another push channel to learn that data changed, but it should still reload authoritative state and handle missed messages. An initial scheduling deployment can begin with ordinary polling.

## Deliver a booking event

After a booking commits, the reminder system needs `AppointmentBooked` with a stable event ID, organization and site scope, appointment ID and occurrence time. It does not need patient clinical notes. The producer records the event in the same database transaction as the appointment, then a worker sends it. The HTTP request can return after commit without waiting for email or a webhook destination. This outbox design addresses a specific dual-write failure: a committed appointment with no corresponding reminder signal.

Delivery can be **at least once**: the worker retries when it cannot confirm receipt, and the consumer deduplicates by event ID. The consumer must tolerate an event arriving after cancellation or another event. Do not promise exactly-once effects merely because one message broker or HTTP call succeeded. State whether order is guaranteed per appointment, per organization or not at all. Preserve a dead-letter or repair path for repeated failure.

For a webhook, register and verify a destination, sign the exact delivered bytes with a rotating secret, include a timestamp and event ID, use TLS, bound delivery attempts and retry with backoff. The receiver verifies signature and freshness, then stores the event ID before applying a repeatable effect. A `2xx` acknowledges delivery; a timeout leaves the sender uncertain, so it may redeliver. The sender must constrain callback destinations to avoid server-side request forgery. Publish replay and retention policy alongside the event schema. These are API contract decisions, not properties automatically supplied by HTTP.

[AsyncAPI 3.0](https://www.asyncapi.com/docs/reference/specification/v3.0.0) describes message-driven APIs, channels and operations. [CloudEvents 1.0.2](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md) provides a common event context and format. AsyncAPI describes an interface; CloudEvents describes an event envelope. Neither guarantees delivery, ordering or authorization. Use them when interoperability and tooling justify the added contract work. The organization can start with a small documented internal event if it has one consumer.

## Gateways, BFFs and service ownership

An API gateway can terminate TLS, route requests, apply coarse rate limits and centralize some identity checks. The appointment application still checks organization membership, site permission and object access. A **backend for frontend** (BFF) can assemble agenda data for a particular screen when repeated client calls cause real latency or awkward contracts. It should not become a second owner of booking policy. [Azure's API design guidance](https://learn.microsoft.com/en-us/azure/architecture/microservices/design/api-design) discusses BFFs and service API boundaries.

Start with one deployable service if the organization's scheduling rules and data change together. Split a reminder service or another capability only when independent scaling, ownership or integration pressure pays for the network and operational cost. The [module-boundary guide](../foundations/module-boundaries-and-public-apis.md) explains supported source APIs within a deployable; the [evolution guide](../foundations/evolution-and-scaling.md) considers when to separate deployment. An HTTP route between two modules is not automatically a better boundary than a narrow in-process API.

Whichever style is chosen, review a rule change, an integration replacement and a new consumer. The scheduling policy should have one authoritative owner; transport adapters translate around it. The public interface must state what each consumer can observe and how failures are recovered.

[Previous: Reliability and Operations](reliability-and-operations.md) · [Exercises](exercises/README.md) · [Sources](references.md) · [API Design route](README.md)
