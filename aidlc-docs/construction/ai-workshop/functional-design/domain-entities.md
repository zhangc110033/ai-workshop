# Domain Entities — AI Workshop

## PR (Pull Request)
```typescript
interface PR {
  number: number;
  title: string;
  author: string;
  url: string;
  headBranch: string;
  baseBranch: string;
  createdAt: string;
  updatedAt: string;
}
```

## Issue
```typescript
interface Issue {
  number: number;
  title: string;
  body: string;
  author: string;
  url: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}
```

## RepoContext
```typescript
interface RepoContext {
  name: string;
  description: string;
  readme: string;
  primaryLanguage: string;
  topics: string[];
}
```

## AuditEntry
```typescript
interface AuditEntry {
  operationTime: Date;
  operationType: 'pr_review' | 'issue_reply' | 'issue_label' | 'spam_close' | 'no_op';
  operationLog: string;  // JSON string with operation details
  operatorEmail: string;
  targetRepo: string;
  targetId: number;      // PR or Issue number (0 for no_op)
}
```

## PRReviewResult
```typescript
interface PRReviewResult {
  prNumber: number;
  action: 'approved' | 'commented' | 'skipped';
  redFlags: string[];
  comment: string;
}
```

## IssueReplyResult
```typescript
interface IssueReplyResult {
  issueNumber: number;
  action: 'replied' | 'spam_closed' | 'skipped';
  isSpam: boolean;
  comment: string;
}
```

## IssueLabelResult
```typescript
interface IssueLabelResult {
  issueNumber: number;
  action: 'labeled' | 'skipped';
  label: string;
  alreadyTagged: boolean;
}
```

## Rule Types
```typescript
interface PRReviewRules {
  redFlags: RedFlagRule[];
}

interface RedFlagRule {
  id: string;
  name: string;
  description: string;
  pattern: string;       // file pattern or keyword
  severity: 'high' | 'medium' | 'low';
}

interface SpamDetectionRules {
  indicators: SpamIndicator[];
  threshold: number;     // score threshold to classify as spam
}

interface SpamIndicator {
  id: string;
  name: string;
  description: string;
  pattern: string;
  weight: number;
}

interface IssueLabelingRules {
  categories: LabelCategory[];
  defaultLabel: string;
}

interface LabelCategory {
  label: string;
  description: string;
  keywords: string[];
}
```

## Config
```typescript
interface AppConfig {
  repositoryUrl: string;
  operatorEmail: string;
  databaseUrl: string;
  cronSchedule: string;  // default: '*/10 * * * *'
  rulesDir: string;      // default: './rules'
}
```
