"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubService = void 0;
const exec_1 = require("../utils/exec");
const retry_1 = require("../utils/retry");
const logger_1 = require("../utils/logger");
const log = (0, logger_1.createChildLogger)({ service: 'github' });
function isRetryable(err) {
    const msg = err.message.toLowerCase();
    return msg.includes('timeout') || msg.includes('network') || msg.includes('econnreset');
}
class GitHubService {
    repoSlug;
    constructor(repoSlug) {
        this.repoSlug = repoSlug;
    }
    async listOpenPRs() {
        return (0, retry_1.withRetry)(async () => {
            const { stdout } = await (0, exec_1.execCommand)(`gh pr list --repo ${this.repoSlug} --state open --json number,title,author,url,headRefName,baseRefName,createdAt,updatedAt`);
            if (!stdout || stdout === '[]')
                return [];
            return JSON.parse(stdout);
        }, { retryOn: isRetryable });
    }
    async getPRDiff(prNumber) {
        return (0, retry_1.withRetry)(async () => {
            const { stdout } = await (0, exec_1.execCommand)(`gh pr diff ${prNumber} --repo ${this.repoSlug}`);
            return stdout;
        }, { retryOn: isRetryable });
    }
    async reviewPR(prNumber, body, approve) {
        const flag = approve ? '--approve' : '--comment';
        const escapedBody = body.replace(/"/g, '\\"').replace(/`/g, '\\`');
        await (0, retry_1.withRetry)(async () => {
            await (0, exec_1.execCommand)(`gh pr review ${prNumber} --repo ${this.repoSlug} ${flag} --body "${escapedBody}"`);
        }, { retryOn: isRetryable });
        log.info({ prNumber, approve }, 'PR reviewed');
    }
    async listOpenIssues() {
        return (0, retry_1.withRetry)(async () => {
            const { stdout } = await (0, exec_1.execCommand)(`gh issue list --repo ${this.repoSlug} --state open --json number,title,body,author,url,labels,createdAt,updatedAt --limit 50`);
            if (!stdout || stdout === '[]')
                return [];
            return JSON.parse(stdout);
        }, { retryOn: isRetryable });
    }
    async getIssueComments(issueNumber) {
        return (0, retry_1.withRetry)(async () => {
            const { stdout } = await (0, exec_1.execCommand)(`gh issue view ${issueNumber} --repo ${this.repoSlug} --json comments --jq '.comments'`);
            if (!stdout || stdout === '[]')
                return [];
            return JSON.parse(stdout);
        }, { retryOn: isRetryable });
    }
    async commentOnIssue(issueNumber, body) {
        const escapedBody = body.replace(/"/g, '\\"').replace(/`/g, '\\`');
        await (0, retry_1.withRetry)(async () => {
            await (0, exec_1.execCommand)(`gh issue comment ${issueNumber} --repo ${this.repoSlug} --body "${escapedBody}"`);
        }, { retryOn: isRetryable });
        log.info({ issueNumber }, 'Issue commented');
    }
    async closeIssue(issueNumber) {
        await (0, retry_1.withRetry)(async () => {
            await (0, exec_1.execCommand)(`gh issue close ${issueNumber} --repo ${this.repoSlug}`);
        }, { retryOn: isRetryable });
        log.info({ issueNumber }, 'Issue closed');
    }
    async addLabel(issueNumber, label) {
        await (0, retry_1.withRetry)(async () => {
            await (0, exec_1.execCommand)(`gh issue edit ${issueNumber} --repo ${this.repoSlug} --add-label "${label}"`);
        }, { retryOn: isRetryable });
        log.info({ issueNumber, label }, 'Label added');
    }
    async getRepoContext() {
        return (0, retry_1.withRetry)(async () => {
            const { stdout } = await (0, exec_1.execCommand)(`gh repo view ${this.repoSlug} --json name,description,primaryLanguage,repositoryTopics`);
            const repo = JSON.parse(stdout);
            let readme = '';
            try {
                const readmeResult = await (0, exec_1.execCommand)(`gh api repos/${this.repoSlug}/readme --jq '.content' | base64 -d`, { timeout: 10000 });
                readme = readmeResult.stdout;
            }
            catch {
                log.warn('Could not fetch README');
            }
            return { ...repo, readme };
        }, { retryOn: isRetryable });
    }
    async verifyAuth() {
        const { stdout } = await (0, exec_1.execCommand)('gh auth status');
        log.info('GitHub CLI authenticated');
    }
}
exports.GitHubService = GitHubService;
//# sourceMappingURL=github.js.map