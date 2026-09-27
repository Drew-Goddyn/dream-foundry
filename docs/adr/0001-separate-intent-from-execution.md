---
status: proposed
---
# Separate durable intent from live execution authority

Keep reviewed intent and Work Orders in GitHub while the local Workboard owns current Assignments and evidence linkage. GitHub-only coordination minimizes code but issue comments are not atomic claims; putting all intent in a runtime database hides human decisions from review. This separation introduces a synchronization seam only when synchronization is actually implemented.

For the fast prototype, logical ownership belongs to one CLI module, not a required daemon or provider scheduler. A database transaction is enough for short-lived local clients to coordinate. Deferred automation must not be inferred from this decision.
