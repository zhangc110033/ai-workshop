import { GitHubService } from '../services/github';
import { AuditService } from '../services/audit';
import { RuleEngine } from '../rules/engine';
import type { IssueReplyResult } from '../types';
export declare class IssueReplyAgent {
    private github;
    private rules;
    private audit;
    constructor(github: GitHubService, rules: RuleEngine, audit: AuditService);
    execute(): Promise<IssueReplyResult[]>;
    private processIssue;
    private evaluateSpam;
    private generateReply;
}
//# sourceMappingURL=issue-reply.d.ts.map