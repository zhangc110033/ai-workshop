import type { PR, Issue, RepoContext, IssueComment } from '../types';
export declare class GitHubService {
    private repoSlug;
    constructor(repoSlug: string);
    listOpenPRs(): Promise<PR[]>;
    getPRDiff(prNumber: number): Promise<string>;
    reviewPR(prNumber: number, body: string, approve: boolean): Promise<void>;
    listOpenIssues(): Promise<Issue[]>;
    getIssueComments(issueNumber: number): Promise<IssueComment[]>;
    commentOnIssue(issueNumber: number, body: string): Promise<void>;
    closeIssue(issueNumber: number): Promise<void>;
    addLabel(issueNumber: number, label: string): Promise<void>;
    getRepoContext(): Promise<RepoContext>;
    verifyAuth(): Promise<void>;
}
//# sourceMappingURL=github.d.ts.map