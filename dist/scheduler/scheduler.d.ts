import { PRReviewAgent } from '../agents/pr-review';
import { IssueReplyAgent } from '../agents/issue-reply';
import { IssueLabelAgent } from '../agents/issue-label';
export declare class Scheduler {
    private cronSchedule;
    private prReviewAgent;
    private issueReplyAgent;
    private issueLabelAgent;
    private task;
    private running;
    constructor(cronSchedule: string, prReviewAgent: PRReviewAgent, issueReplyAgent: IssueReplyAgent, issueLabelAgent: IssueLabelAgent);
    start(): void;
    stop(): void;
    isRunning(): boolean;
    runAll(): Promise<void>;
}
//# sourceMappingURL=scheduler.d.ts.map