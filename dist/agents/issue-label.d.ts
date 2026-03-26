import { GitHubService } from '../services/github';
import { AuditService } from '../services/audit';
import { RuleEngine } from '../rules/engine';
import type { IssueLabelResult } from '../types';
export declare class IssueLabelAgent {
    private github;
    private rules;
    private audit;
    constructor(github: GitHubService, rules: RuleEngine, audit: AuditService);
    execute(): Promise<IssueLabelResult[]>;
    private labelIssue;
    private classifyIssue;
}
//# sourceMappingURL=issue-label.d.ts.map