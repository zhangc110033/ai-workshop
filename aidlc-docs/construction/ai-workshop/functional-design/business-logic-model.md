# Business Logic Model — AI Workshop

## 1. App Lifecycle

### bootstrap()
```
1. Load .env (dotenv)
2. ConfigService.validate()
   - Assert REPOSITORY_URL exists
   - Assert OPERATOR_EMAIL exists
   - Assert DATABASE_URL exists
3. Parse REPOSITORY_URL → extract owner/repo
4. RuleEngine.loadRules()
5. AuditService.initialize()
   - Create connection pool
   - CREATE TABLE IF NOT EXISTS audit_logs
6. Verify gh CLI is authenticated: `gh auth status`
7. Scheduler.start()
8. Register SIGINT/SIGTERM → shutdown()
```

### shutdown()
```
1. Scheduler.stop()
2. Wait for in-flight tasks (with timeout 30s)
3. AuditService.close()
4. Process.exit(0)
```

## 2. Scheduler Logic

### Every 10 minutes (cron: */10 * * * *)
```
1. Log "Scheduled run started"
2. Execute in parallel (Promise.allSettled):
   - PRReviewAgent.execute()
   - IssueReplyAgent.execute()
   - IssueLabelAgent.execute()
3. For each result:
   - If fulfilled: log success summary
   - If rejected: log error, write audit entry (type: error)
4. Log "Scheduled run completed"
```

## 3. PRReviewAgent.execute()

```
1. prs = GitHubService.listOpenPRs()
2. If prs is empty:
   - AuditService.log({ type: 'no_op', log: 'No open PRs' })
   - Return []
3. rules = RuleEngine.getPRReviewRules()
4. results = []
5. For each pr in prs:
   a. diff = GitHubService.getPRDiff(pr.number)
   b. redFlags = evaluateRedFlags(diff, pr, rules)
   c. If redFlags is empty:
      - comment = "from AI Workshop: PR looks good. No red flags detected. Auto-approved."
      - GitHubService.reviewPR(pr.number, comment, approve=true)
      - result = { action: 'approved', redFlags: [] }
   d. Else:
      - comment = "from AI Workshop: Red flags detected:\n" + formatRedFlags(redFlags)
      - GitHubService.reviewPR(pr.number, comment, approve=false)
      - result = { action: 'commented', redFlags }
   e. AuditService.log({ type: 'pr_review', targetId: pr.number, log: JSON.stringify(result) })
   f. results.push(result)
6. Return results
```

### evaluateRedFlags(diff, pr, rules)
```
redFlags = []
For each rule in rules.redFlags:
  If diff matches rule.pattern OR pr.title/files match rule.pattern:
    redFlags.push(rule)
Return redFlags
```

## 4. IssueReplyAgent.execute()

```
1. issues = GitHubService.listOpenIssues()
2. Filter out issues already commented by "from AI Workshop:"
3. Take first 3 unprocessed issues
4. If none:
   - AuditService.log({ type: 'no_op', log: 'No unprocessed issues' })
   - Return []
5. spamRules = RuleEngine.getSpamDetectionRules()
6. repoContext = GitHubService.getRepoContext()
7. results = []
8. For each issue (max 3):
   a. spamScore = evaluateSpam(issue, spamRules)
   b. If spamScore >= spamRules.threshold:
      - GitHubService.closeIssue(issue.number)
      - AuditService.log({ type: 'spam_close', targetId: issue.number })
      - result = { action: 'spam_closed', isSpam: true }
   c. Else:
      - reply = generateContextualReply(issue, repoContext)
      - comment = "from AI Workshop: " + reply
      - GitHubService.commentOnIssue(issue.number, comment)
      - AuditService.log({ type: 'issue_reply', targetId: issue.number })
      - result = { action: 'replied', isSpam: false, comment }
   d. results.push(result)
9. Return results
```

### evaluateSpam(issue, rules)
```
score = 0
For each indicator in rules.indicators:
  If issue.title + issue.body matches indicator.pattern:
    score += indicator.weight
Return score
```

### generateContextualReply(issue, repoContext)
```
Analyze issue content against repoContext:
- Match issue keywords to repo topics/readme sections
- Generate a helpful reply referencing relevant parts of the repo
- Keep reply concise and actionable
Return reply string
```

## 5. IssueLabelAgent.execute()

```
1. issues = GitHubService.listOpenIssues()
2. Filter: exclude issues where labels include "tagged"
3. If none:
   - AuditService.log({ type: 'no_op', log: 'No untagged issues' })
   - Return []
4. labelRules = RuleEngine.getIssueLabelingRules()
5. results = []
6. For each issue (not tagged):
   a. category = classifyIssue(issue, labelRules)
   b. GitHubService.addLabel(issue.number, category.label)
   c. GitHubService.addLabel(issue.number, "tagged")
   d. AuditService.log({ type: 'issue_label', targetId: issue.number, log: category.label })
   e. results.push({ action: 'labeled', label: category.label })
7. Return results
```

### classifyIssue(issue, rules)
```
For each category in rules.categories:
  If issue.title + issue.body contains any of category.keywords:
    Return category
Return { label: rules.defaultLabel }
```

## 6. RuleEngine.loadRules()

```
1. Read /rules/pr-review-rules.md → parse → PRReviewRules
2. Read /rules/spam-detection-rules.md → parse → SpamDetectionRules
3. Read /rules/issue-labeling-rules.md → parse → IssueLabelingRules
4. Cache parsed rules in memory
5. If any file fails to parse:
   - Log error
   - If previous valid rules exist: keep using them
   - If no previous rules: throw (fail startup)
```

## 7. AuditService

### initialize()
```
1. Create mysql2 connection pool (DATABASE_URL, ssl: true)
2. Execute:
   CREATE TABLE IF NOT EXISTS audit_logs (
     id INT AUTO_INCREMENT PRIMARY KEY,
     operation_time DATETIME NOT NULL,
     operation_type VARCHAR(50) NOT NULL,
     operation_log TEXT NOT NULL,
     operator_email VARCHAR(255) NOT NULL,
     target_repo VARCHAR(500),
     target_id INT DEFAULT 0,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   )
```

### log(entry)
```
INSERT INTO audit_logs (operation_time, operation_type, operation_log, operator_email, target_repo, target_id)
VALUES (entry.operationTime, entry.operationType, entry.operationLog, entry.operatorEmail, entry.targetRepo, entry.targetId)
```

## 8. GitHubService — gh CLI Commands

| Method | gh CLI Command |
|--------|---------------|
| listOpenPRs() | `gh pr list --repo {repo} --state open --json number,title,author,url,headRefName,baseRefName,createdAt,updatedAt` |
| getPRDiff(n) | `gh pr diff {n} --repo {repo}` |
| reviewPR(n, body, approve) | `gh pr review {n} --repo {repo} --approve --body "{body}"` or `--comment` |
| listOpenIssues() | `gh issue list --repo {repo} --state open --json number,title,body,author,url,labels,createdAt,updatedAt` |
| commentOnIssue(n, body) | `gh issue comment {n} --repo {repo} --body "{body}"` |
| closeIssue(n) | `gh issue close {n} --repo {repo}` |
| addLabel(n, label) | `gh issue edit {n} --repo {repo} --add-label "{label}"` |
| getRepoContext() | `gh repo view {repo} --json name,description,readme,primaryLanguage,repositoryTopics` |
