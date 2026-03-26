# Sub-agents (project ops)

This folder contains role briefs for OpenClaw sub-agents used to run **small/medium engineering projects** with a consistent multi-agent workflow.

## Roles
- Klaus-PM → intake, task brief, milestones, acceptance, scope control
- Klaus-CTO → ADR, Design Note, contracts (API/events/fields), parallelization plan
- Klaus-Dev → implementation (small reviewable diffs)
- Klaus-QA → acceptance verification, test plan, release gates
- Klaus-OPS → deploy/runbook/observability/reliability and safe change control

## Recommended collaboration workflow (PingComp CRM)

### 1) Intake → PM
In **#pm** (Klaus-PM thread), paste:
- Background / Goal / Non-goals
- Deadline + priority
- Constraints (auth, security, routing, no-restart rules)
- Success metrics / acceptance evidence

Output: Task Brief v1 + milestones + acceptance checklist + scope freeze point.

### 2) Architecture & contracts → CTO
Copy the Brief to **#cto** (Klaus-CTO thread):
- Ask for ADR + Design Note + contracts + parallel lanes.

Output: ADR + Design Note + versioned contracts + lane breakdown.

### 3) Parallel execution
- **#dev**: implement per contracts (small diffs).
- **#qa**: test plan + risk matrix + release gates.
- **#ops**: deploy plan + rollback + observability (metrics/logs/alerts) + change risk level.

### 4) Integration & sync-back
Main Klaus (or you) syncs back:
- Contract changes → CTO (update + version bump)
- Scope changes → PM (change request)
- Release go/no-go → QA + OPS sign-off + PM acceptance

## Thread-bound sessions note
Sub-agents are **not** Discord identities. Collaboration is done via:
- A role-specific channel (e.g. #pm) + a thread bound to a sub-agent session
- Orchestrator (you/main Klaus) moving artifacts between threads
