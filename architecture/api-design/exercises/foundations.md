# Foundation Exercises

These exercises use the organization contract in the [route map](../README.md). Read [HTTP and Identifiers](../http-and-identifiers.md) first. Write down the observable request and response before naming an implementation file.

**Contents**

- [A-F1 — Name the boundary](#a-f1--name-the-boundary)
- [A-F2 — Select method and outcome](#a-f2--select-method-and-outcome)
- [A-F3 — Classify two failures](#a-f3--classify-two-failures)

## A-F1 — Name the boundary

**Prerequisites.** API, endpoint, route, handler and Controller from [the public boundary](../http-and-identifiers.md#the-public-boundary).

**Starting situation.** A web client calls `GET /v1/physicians/phy_42`. In a Nest server, a route declaration selects `PhysiciansController.getOne`, which calls `GetPhysician.execute`.

**Task.** Label the API, one endpoint, the route, handler, Controller and application operation. State which of these names the client may rely on.

**Expected behavior.** A Controller rename has no public effect if the method, target, authentication, representation and errors stay the same.

**Verification.** Draw or list the request's public and internal boundary, then explain why a method/path match alone is not the whole contract. Compare [A-F1](solutions.md#a-f1--name-the-boundary).

## A-F2 — Select method and outcome

**Prerequisites.** [Method properties](../http-and-identifiers.md#method-properties) and [status meaning](../http-and-identifiers.md#status-and-cache-meaning).

**Starting situation.** A draft design exposes `GET /v1/book?physicianId=phy_42&patientId=pat_18&siteId=site_7` to create an appointment and always responds `200`, even when the slot is occupied.

**Task.** Replace it with a request target, method, success status and conflict status consistent with the organization contract. State whether repeating the request is safe without an application retry contract.

**Expected behavior.** A browser prefetch cannot book a slot. A successful create identifies the new appointment; an occupied slot is an error outcome.

**Verification.** Write a sample request and the two response start lines, including `Location` on creation. Explain safe versus idempotent without calling POST inherently idempotent. Compare [A-F2](solutions.md#a-f2--select-method-and-outcome).

## A-F3 — Classify two failures

**Prerequisites.** [Request messages](../http-and-identifiers.md#a-request-and-a-response), [status meaning](../http-and-identifiers.md#status-and-cache-meaning) and [appointment creation](../resources-and-operations.md#create-and-change-appointments). Complete this exercise after the resource chapter.

**Starting situation.** The caller sends `startsAt: 12` in one request. In another, it selects `site_7` and sends valid RFC 3339 times from `2026-11-12T14:00:00Z` to `2026-11-12T14:30:00Z`, but an active appointment already occupies that physician's interval.

**Task.** Assign each refusal to transport parsing or the scheduling rule, and choose the organization's status for each. State whether either request may write a row.

**Expected behavior.** Unknown request shapes are rejected before the use case; a valid request that cannot satisfy the booking rule is refused without a new appointment.

**Verification.** Give a distinct problem type for each failure and name the decision owner. Compare [A-F3](solutions.md#a-f3--classify-two-failures).

[Exercises](README.md) · [Solutions](solutions.md) · [Next: Design](design.md)
