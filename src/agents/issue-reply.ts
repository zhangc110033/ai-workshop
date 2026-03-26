import { createChildLogger } from '../utils/logger';
import { GitHubService } from '../services/github';
import { AuditService } from '../services/audit';
import { RuleEngine } from '../rules/engine';
import type { IssueReplyResult, Issue, RepoContext } from '../types';
import type { SpamDetectionRules } from '../rules/parser';

const log = createChildLogger({ agent: 'issue-reply' });
const COMMENT_PREFIX = 'from AI Workshop: ';
const MAX_ISSUES_PER_RUN = 3;
const TAGGED_LABEL = 'tagged';

export class IssueReplyAgent {
  constructor(
    private github: GitHubService,
    private rules: RuleEngine,
    private audit: AuditService
  ) {}

  async execute(): Promise<IssueReplyResult[]> {
    log.info('Starting issue reply scan');
    const issues = await this.github.listOpenIssues();

    // Filter out already-processed issues (have "tagged" label)
    const unprocessed = issues
      .filter((issue) => !issue.labels.some((l) => l.name === TAGGED_LABEL))
      .slice(0, MAX_ISSUES_PER_RUN);

    if (unprocessed.length === 0) {
      log.info('No unprocessed issues found');
      await this.audit.log({
        operationTime: new Date(),
        operationType: 'no_op',
        operationLog: JSON.stringify({ message: 'No unprocessed issues' }),
        targetId: 0,
      });
      return [];
    }

    const spamRules = this.rules.getSpamDetectionRules();
    const repoContext = await this.github.getRepoContext();
    const results: IssueReplyResult[] = [];

    for (const issue of unprocessed) {
      try {
        const result = await this.processIssue(issue, spamRules, repoContext);
        results.push(result);
      } catch (err) {
        log.error({ issueNumber: issue.number, err }, 'Failed to process issue');
        await this.audit.log({
          operationTime: new Date(),
          operationType: 'issue_reply',
          operationLog: JSON.stringify({ error: String(err), issueNumber: issue.number }),
          targetId: issue.number,
        });
      }
    }

    log.info({ count: results.length }, 'Issue reply scan complete');
    return results;
  }

  private async processIssue(
    issue: Issue,
    spamRules: SpamDetectionRules,
    repoContext: RepoContext
  ): Promise<IssueReplyResult> {
    const spamScore = this.evaluateSpam(issue, spamRules);

    if (spamScore >= spamRules.threshold) {
      await this.github.closeIssue(issue.number);
      log.info({ issueNumber: issue.number, spamScore }, 'SPAM issue closed');

      await this.audit.log({
        operationTime: new Date(),
        operationType: 'spam_close',
        operationLog: JSON.stringify({ issueNumber: issue.number, spamScore }),
        targetId: issue.number,
      });

      return { issueNumber: issue.number, action: 'spam_closed', isSpam: true, comment: '' };
    }

    const reply = this.generateReply(issue, repoContext);
    const comment = `${COMMENT_PREFIX}${reply}`;
    await this.github.commentOnIssue(issue.number, comment);
    await this.github.addLabel(issue.number, TAGGED_LABEL);

    await this.audit.log({
      operationTime: new Date(),
      operationType: 'issue_reply',
      operationLog: JSON.stringify({ issueNumber: issue.number, reply: reply.substring(0, 200) }),
      targetId: issue.number,
    });

    return { issueNumber: issue.number, action: 'replied', isSpam: false, comment };
  }

  private evaluateSpam(issue: Issue, rules: SpamDetectionRules): number {
    let score = 0;
    const content = `${issue.title} ${issue.body}`.toLowerCase();

    for (const indicator of rules.indicators) {
      const matched = indicator.keywords.some((keyword) => content.includes(keyword));
      if (matched) {
        score += indicator.weight;
      }
    }

    // Check for empty/very short body
    if (!issue.body || issue.body.trim().length < 10) {
      score += 2;
    }

    // Check for excessive links
    const urlCount = (content.match(/https?:\/\//g) || []).length;
    if (urlCount > 3) {
      score += 2;
    }

    return score;
  }

  private generateReply(issue: Issue, repoContext: RepoContext): string {
    const repoName = repoContext.name;
    const lang = repoContext.primaryLanguage?.name || 'this project';
    const topics = repoContext.repositoryTopics?.map((t) => t.name).join(', ') || '';

    const lines: string[] = [
      `Thank you for opening this issue on **${repoName}**.`,
      '',
    ];

    if (issue.title.toLowerCase().includes('bug') || issue.body?.toLowerCase().includes('error')) {
      lines.push(
        'This appears to be a bug report. The team will investigate and get back to you.',
        'In the meantime, please ensure you have provided:',
        '- Steps to reproduce',
        '- Expected vs actual behavior',
        '- Environment details (OS, version, etc.)',
      );
    } else if (issue.title.toLowerCase().includes('feature') || issue.body?.toLowerCase().includes('request')) {
      lines.push(
        'This looks like a feature request. The team will review it and assess feasibility.',
        `This project focuses on ${topics || lang}, so please ensure the request aligns with the project scope.`,
      );
    } else {
      lines.push(
        'The team will review this issue and respond as soon as possible.',
        `This project (${lang}) is actively maintained. You can check the README for more context.`,
      );
    }

    return lines.join('\n');
  }
}
