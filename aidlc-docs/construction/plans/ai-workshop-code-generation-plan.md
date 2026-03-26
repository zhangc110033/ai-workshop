# Code Generation Plan — AI Workshop

## Project Structure
```
ai-workshop/                    # Workspace root
  src/
    types/index.ts              # Shared type definitions
    services/config.ts          # ConfigService
    services/github.ts          # GitHubService (gh CLI wrapper)
    services/audit.ts           # AuditService (TiDB)
    rules/engine.ts             # RuleEngine
    rules/parser.ts             # Markdown rule parser
    agents/pr-review.ts         # PRReviewAgent
    agents/issue-reply.ts       # IssueReplyAgent
    agents/issue-label.ts       # IssueLabelAgent
    scheduler/scheduler.ts      # Scheduler (node-cron)
    utils/retry.ts              # Retry utility
    utils/exec.ts               # CLI executor utility
    utils/logger.ts             # Logger (pino)
    app.ts                      # App entry point
  rules/
    pr-review-rules.md          # PR Review red flag rules
    spam-detection-rules.md     # SPAM detection rules
    issue-labeling-rules.md     # Issue labeling rules
  tests/
    services/config.test.ts
    services/github.test.ts
    services/audit.test.ts
    rules/engine.test.ts
    agents/pr-review.test.ts
    agents/issue-reply.test.ts
    agents/issue-label.test.ts
  package.json
  tsconfig.json
  .eslintrc.json
  .prettierrc
  .env.example
```

## Execution Steps

### Step 1: Project Scaffolding
- [x] 1.1 Create package.json with dependencies
- [x] 1.2 Create tsconfig.json
- [x] 1.3 Create .eslintrc.json and .prettierrc
- [x] 1.4 Update .env.example with all required variables

### Step 2: Shared Types & Utilities
- [x] 2.1 Create src/types/index.ts (all domain entities)
- [x] 2.2 Create src/utils/logger.ts (pino logger)
- [x] 2.3 Create src/utils/retry.ts (retry with exponential backoff)
- [x] 2.4 Create src/utils/exec.ts (CLI executor)

### Step 3: Core Services
- [x] 3.1 Create src/services/config.ts (ConfigService)
- [x] 3.2 Create src/services/github.ts (GitHubService)
- [x] 3.3 Create src/services/audit.ts (AuditService)

### Step 4: Rule Engine
- [x] 4.1 Create src/rules/parser.ts (Markdown rule parser)
- [x] 4.2 Create src/rules/engine.ts (RuleEngine)
- [x] 4.3 Create rules/pr-review-rules.md
- [x] 4.4 Create rules/spam-detection-rules.md
- [x] 4.5 Create rules/issue-labeling-rules.md

### Step 5: Agents
- [x] 5.1 Create src/agents/pr-review.ts (PRReviewAgent)
- [x] 5.2 Create src/agents/issue-reply.ts (IssueReplyAgent)
- [x] 5.3 Create src/agents/issue-label.ts (IssueLabelAgent)

### Step 6: Scheduler & App
- [x] 6.1 Create src/scheduler/scheduler.ts
- [x] 6.2 Create src/app.ts (entry point)

### Step 7: Tests
- [x] 7.1 Create tests for services
- [x] 7.2 Create tests for rule engine
- [x] 7.3 Create tests for agents

---
