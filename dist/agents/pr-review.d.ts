import { GitHubService } from '../services/github';
import { AuditService } from '../services/audit';
import { RuleEngine } from '../rules/engine';
import type { PRReviewResult } from '../types';
export declare class PRReviewAgent {
    private github;
    private rules;
    private audit;
    constructor(github: GitHubService, rules: RuleEngine, audit: AuditService);
    execute(): Promise<PRReviewResult[]>;
    private reviewPR;
    private evaluateRedFlags;
}
//# sourceMappingURL=pr-review.d.ts.map