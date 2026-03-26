import { createChildLogger } from '../utils/logger';
import { GitHubService } from '../services/github';
import { AuditService } from '../services/audit';
import { RuleEngine } from '../rules/engine';
import type { PRReviewResult } from '../types';
import type { RedFlagRule } from '../rules/parser';

const log = createChildLogger({ agent: 'pr-review' });
const COMMENT_PREFIX = 'from AI Workshop: ';

export class PRReviewAgent {
  constructor(
    private github: GitHubService,
    private rules: RuleEngine,
    private audit: AuditService
  ) {}

  async execute(): Promise<PRReviewResult[]> {
    log.info('Starting PR review scan');
    const prs = await this.github.listOpenPRs();

    if (prs.length === 0) {
      log.info('No open PRs found');
      await this.audit.log({
        operationTime: new Date(),
        operationType: 'no_op',
        operationLog: JSON.stringify({ message: 'No open PRs' }),
        targetId: 0,
      });
      return [];
    }

    const reviewRules = this.rules.getPRReviewRules();
    const results: PRReviewResult[] = [];

    for (const pr of prs) {
      try {
        const result = await this.reviewPR(pr.number, pr.title, reviewRules.redFlags);
        results.push(result);
      } catch (err) {
        log.error({ prNumber: pr.number, err }, 'Failed to review PR');
        await this.audit.log({
          operationTime: new Date(),
          operationType: 'pr_review',
          operationLog: JSON.stringify({ error: String(err), prNumber: pr.number }),
          targetId: pr.number,
        });
      }
    }

    log.info({ count: results.length }, 'PR review scan complete');
    return results;
  }

  private async reviewPR(
    prNumber: number,
    prTitle: string,
    redFlagRules: RedFlagRule[]
  ): Promise<PRReviewResult> {
    const diff = await this.github.getPRDiff(prNumber);
    const redFlags = this.evaluateRedFlags(diff, prTitle, redFlagRules);

    let comment: string;
    let approve: boolean;

    if (redFlags.length === 0) {
      comment = `${COMMENT_PREFIX}PR looks good. No red flags detected. Auto-approved.`;
      approve = true;
    } else {
      const flagList = redFlags.map((f) => `- **${f.name}** (${f.severity}): ${f.description}`).join('\n');
      comment = `${COMMENT_PREFIX}Red flags detected:\n${flagList}`;
      approve = false;
    }

    await this.github.reviewPR(prNumber, comment, approve);

    const result: PRReviewResult = {
      prNumber,
      action: approve ? 'approved' : 'commented',
      redFlags: redFlags.map((f) => f.name),
      comment,
    };

    await this.audit.log({
      operationTime: new Date(),
      operationType: 'pr_review',
      operationLog: JSON.stringify(result),
      targetId: prNumber,
    });

    return result;
  }

  private evaluateRedFlags(
    diff: string,
    prTitle: string,
    rules: RedFlagRule[]
  ): RedFlagRule[] {
    const flags: RedFlagRule[] = [];
    const content = `${prTitle}\n${diff}`;

    for (const rule of rules) {
      if (rule.pattern === 'LARGE_DIFF_1000') {
        if (diff.split('\n').length > 1000) {
          flags.push(rule);
        }
        continue;
      }

      try {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(content)) {
          flags.push(rule);
        }
      } catch {
        log.warn({ ruleId: rule.id, pattern: rule.pattern }, 'Invalid regex pattern in rule');
      }
    }

    return flags;
  }
}
