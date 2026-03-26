import { execCommand } from '../utils/exec';
import { withRetry } from '../utils/retry';
import { createChildLogger } from '../utils/logger';
import type { PR, Issue, RepoContext, IssueComment } from '../types';

const log = createChildLogger({ service: 'github' });

function isRetryable(err: Error): boolean {
  const msg = err.message.toLowerCase();
  return msg.includes('timeout') || msg.includes('network') || msg.includes('econnreset');
}

export class GitHubService {
  constructor(private repoSlug: string) {}

  async listOpenPRs(): Promise<PR[]> {
    return withRetry(async () => {
      const { stdout } = await execCommand(
        `gh pr list --repo ${this.repoSlug} --state open --json number,title,author,url,headRefName,baseRefName,createdAt,updatedAt`
      );
      if (!stdout || stdout === '[]') return [];
      return JSON.parse(stdout) as PR[];
    }, { retryOn: isRetryable });
  }

  async getPRDiff(prNumber: number): Promise<string> {
    return withRetry(async () => {
      const { stdout } = await execCommand(
        `gh pr diff ${prNumber} --repo ${this.repoSlug}`
      );
      return stdout;
    }, { retryOn: isRetryable });
  }

  async reviewPR(prNumber: number, body: string, approve: boolean): Promise<void> {
    const flag = approve ? '--approve' : '--comment';
    const escapedBody = body.replace(/"/g, '\\"').replace(/`/g, '\\`');
    await withRetry(async () => {
      await execCommand(
        `gh pr review ${prNumber} --repo ${this.repoSlug} ${flag} --body "${escapedBody}"`
      );
    }, { retryOn: isRetryable });
    log.info({ prNumber, approve }, 'PR reviewed');
  }

  async listOpenIssues(): Promise<Issue[]> {
    return withRetry(async () => {
      const { stdout } = await execCommand(
        `gh issue list --repo ${this.repoSlug} --state open --json number,title,body,author,url,labels,createdAt,updatedAt --limit 50`
      );
      if (!stdout || stdout === '[]') return [];
      return JSON.parse(stdout) as Issue[];
    }, { retryOn: isRetryable });
  }

  async getIssueComments(issueNumber: number): Promise<IssueComment[]> {
    return withRetry(async () => {
      const { stdout } = await execCommand(
        `gh issue view ${issueNumber} --repo ${this.repoSlug} --json comments --jq '.comments'`
      );
      if (!stdout || stdout === '[]') return [];
      return JSON.parse(stdout) as IssueComment[];
    }, { retryOn: isRetryable });
  }

  async commentOnIssue(issueNumber: number, body: string): Promise<void> {
    const escapedBody = body.replace(/"/g, '\\"').replace(/`/g, '\\`');
    await withRetry(async () => {
      await execCommand(
        `gh issue comment ${issueNumber} --repo ${this.repoSlug} --body "${escapedBody}"`
      );
    }, { retryOn: isRetryable });
    log.info({ issueNumber }, 'Issue commented');
  }

  async closeIssue(issueNumber: number): Promise<void> {
    await withRetry(async () => {
      await execCommand(
        `gh issue close ${issueNumber} --repo ${this.repoSlug}`
      );
    }, { retryOn: isRetryable });
    log.info({ issueNumber }, 'Issue closed');
  }

  async addLabel(issueNumber: number, label: string): Promise<void> {
    await withRetry(async () => {
      try {
        await execCommand(
          `gh issue edit ${issueNumber} --repo ${this.repoSlug} --add-label "${label}"`
        );
      } catch (err) {
        // Label might not exist, try to create it first
        if (err instanceof Error && err.message.includes('not found')) {
          await execCommand(
            `gh label create "${label}" --repo ${this.repoSlug} --force`
          );
          await execCommand(
            `gh issue edit ${issueNumber} --repo ${this.repoSlug} --add-label "${label}"`
          );
        } else {
          throw err;
        }
      }
    }, { retryOn: isRetryable });
    log.info({ issueNumber, label }, 'Label added');
  }

  async getRepoContext(): Promise<RepoContext> {
    return withRetry(async () => {
      const { stdout } = await execCommand(
        `gh repo view ${this.repoSlug} --json name,description,primaryLanguage,repositoryTopics`
      );
      const repo = JSON.parse(stdout);

      let readme = '';
      try {
        const readmeResult = await execCommand(
          `gh api repos/${this.repoSlug}/readme --jq '.content' | base64 -d`,
          { timeout: 10000 }
        );
        readme = readmeResult.stdout;
      } catch {
        log.warn('Could not fetch README');
      }

      return { ...repo, readme } as RepoContext;
    }, { retryOn: isRetryable });
  }

  async verifyAuth(): Promise<void> {
    const { stdout } = await execCommand('gh auth status');
    log.info('GitHub CLI authenticated');
  }
}
