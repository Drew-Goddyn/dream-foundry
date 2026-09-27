---
status: proposed
---
# Separate durable intent from live execution authority

Keep reviewed intent and Work Orders in GitHub, but let a single local controller own live Assignments, resource reservations, and recovery once automation is implemented. GitHub-only coordination minimizes custom code, but using issue edits as leases creates ambiguous ownership and recovery; making the runtime ledger authoritative for everything would hide human intent from the review workflow. This separation trades an explicit synchronization/reconciliation seam for clearer authority, inspectable decisions, and a path from manual launches to bounded automation. Bootstrap uses explicit manual assignments until that seam is implemented and independently tested.
