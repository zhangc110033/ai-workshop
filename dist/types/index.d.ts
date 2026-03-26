export interface PR {
    number: number;
    title: string;
    author: {
        login: string;
    };
    url: string;
    headRefName: string;
    baseRefName: string;
    createdAt: string;
    updatedAt: string;
}
export interface Issue {
    number: number;
    title: string;
    body: string;
    author: {
        login: string;
    };
    url: string;
    labels: {
        name: string;
    }[];
    createdAt: string;
    updatedAt: string;
    comments?: IssueComment[];
}
export interface IssueComment {
    body: string;
    author: {
        login: string;
    };
}
export interface RepoContext {
    name: string;
    description: string;
    readme: string;
    primaryLanguage: {
        name: string;
    } | null;
    repositoryTopics: {
        name: string;
    }[];
}
export interface AuditEntry {
    operationTime: Date;
    operationType: 'pr_review' | 'issue_reply' | 'issue_label' | 'spam_close' | 'no_op';
    operationLog: string;
    operatorEmail: string;
    targetRepo: string;
    targetId: number;
}
export interface PRReviewResult {
    prNumber: number;
    action: 'approved' | 'commented' | 'skipped';
    redFlags: string[];
    comment: string;
}
export interface IssueReplyResult {
    issueNumber: number;
    action: 'replied' | 'spam_closed' | 'skipped';
    isSpam: boolean;
    comment: string;
}
export interface IssueLabelResult {
    issueNumber: number;
    action: 'labeled' | 'skipped';
    label: string;
    alreadyTagged: boolean;
}
//# sourceMappingURL=index.d.ts.map