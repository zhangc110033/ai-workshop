---
name: autopilot-delivery-team
description: Orchestrate complex delivery work with multiple sub-agents (PM/CTO/Dev/QA/Ops) in "autopilot" mode: main agent dispatches silent sub-agent runs, collects outputs, writes artifacts, and only interrupts the user for explicit blocking decisions. Use when user asks to run a project with multiple roles, wants continuous execution without repeated confirmations, wants silent thread dispatch, or asks for a stable multi-agent workflow/phase machine.
---

# Autopilot Delivery Team

Goal: run a small/medium engineering project using **multiple role sub-agents** with **run-mode ignition** (no reliance on thread MESSAGE_CREATE), **silent dispatch**, and **blocking-only interrupts**.

## Defaults (hard rules)
- Use `sessions_spawn(mode="run")` to ignite work.
- Deliver role outputs via `message(action=send, silent=true)` into the target role threads.
- In the control channel (#cmd), post only:
  - status
  - blocking decisions (1–3 items)
  - next automatic step
- Do not ask for “continue/confirm next” unless a Blocking condition triggers.

## Blocking conditions (only these interrupt)
1) Scope Freeze change / product decision required.
2) Production / money / security / irreversible action required.
3) Conflicting outputs across roles that can’t be resolved mechanically.
4) Missing critical inputs (ask max 10 questions).

## Inputs required (ask only if missing)
- Project name
- Milestones (or deadlines)
- Scope Freeze (what must NOT be done)
- Repo/path (if implementation)
- Target delivery location (Discord thread ids) OR confirm “use default delivery threads”.

## Role set (default)
- Klaus-PM: Task Brief + milestones + acceptance + change control.
- Klaus-CTO: ADR + Design Note + contracts (API/fields/errors/observability).
- Klaus-Dev: implementation plan or code (only if user authorized).
- Klaus-QA: test plan + evidence pack + release gates.
- Klaus-OPS: deploy/rollback/observability/runbook (no auto-restart/update).

## Orchestration loop (phase machine)
1) PM run → Brief v1 + acceptance + scope freeze point.
2) CTO run → contracts + risk/guardrails.
3) Dev run(s) → sliced PR plan (or PRs) + smoke steps.
4) QA run → acceptance mapping + evidence checklist.
5) Ops run → deploy/rollback/observe.
6) Main agent merges outputs → writes artifacts to `~/clawd-workspace/<project>/`.
7) Post 1 summary in control channel + silent dispatch to role threads.
8) If no blocking: automatically start next phase.

## Artifact policy
- Always write key outputs to files under:
  - `~/git/ai-workshop-workspace/<project>/`
- File names (suggested):
  - `PM_TaskBrief.md`, `CTO_Contracts.md`, `DEV_Plan.md`, `QA_Evidence.md`, `OPS_Runbook.md`

## How to start (pattern)
When the user says “start autopilot” or “run all”:
- Create/confirm a project folder under `clawd-workspace`.
- Spawn 5 runs in parallel.
- Wait for completion; merge; dispatch; summarize.

If the user wants continuous execution (pipeline), continue spawning the next run(s) until done or blocked.
