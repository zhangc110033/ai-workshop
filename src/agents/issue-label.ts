import { createChildLogger } from '../utils/logger';
import { GitHubService } from '../services/github';
import { AuditService } from '../services/audit';
import { RuleEngine } from '../rules/engine';
import type { IssueLabelResult, Issue } from '../types';
import type { IssueLabelingRules, LabelCategory } from '../rules/parser';

const log = createChildLogger({ agent: 'issue-label' });
const TAGGED_LABEL = 'tagged';

export class IssueLabelAgent {
  constructor(
    private github: GitHubService,
    private rules: RuleEngine,
    private audit: AuditService
  ) {}

  async execute(): Promise<IssueLabelResult[]> {
    log.info('Starting issue label scan');
    const issues = await this.github.listOpenIssues();

    const untagged = issues.filter(
      (issue) => !issue.labels.some((l) => l.name === TAGGED_LABEL)
    );

    if (untagged.length === 0) {
      log.info('No untagged issues found');
      await this.audit.log({
        operationTime: new Date(),
        operationType: 'no_op',
        operationLog: JSON.stringify({ message: 'No untagged issues' }),
        targetId: 0,
      });
      return [];
    }

    const labelRules = this.rules.getIssueLabelingRules();
    const results: IssueLabelResult[] = [];

    for (const issue of untagged) {
      try {
        const result = await this.labelIssue(issue, labelRules);
        results.push(result);
      } catch (err) {
        log.error({ issueNumber: issue.number, err }, 'Failed to label issue');
        await this.audit.log({
          operationTime: new Date(),
          operationType: 'issue_label',
          operationLog: JSON.stringify({ error: String(err), issueNumber: issue.number }),
          targetId: issue.number,
        });
      }
    }

    log.info({ count: results.length }, 'Issue label scan complete');
    return results;
  }

  private async labelIssue(
    issue: Issue,
    rules: IssueLabelingRules
  ): Promise<IssueLabelResult> {
    const category = this.classifyIssue(issue, rules);

    await this.github.addLabel(issue.number, category.label);
    await this.github.addLabel(issue.number, TAGGED_LABEL);

    log.info({ issueNumber: issue.number, label: category.label }, 'Issue labeled');

    await this.audit.log({
      operationTime: new Date(),
      operationType: 'issue_label',
      operationLog: JSON.stringify({ issueNumber: issue.number, label: category.label }),
      targetId: issue.number,
    });

    return {
      issueNumber: issue.number,
      action: 'labeled',
      label: category.label,
      alreadyTagged: false,
    };
  }

  private classifyIssue(issue: Issue, rules: IssueLabelingRules): LabelCategory {
    const content = `${issue.title} ${issue.body || ''}`.toLowerCase();

    for (const category of rules.categories) {
      const matched = category.keywords.some((keyword) => content.includes(keyword));
      if (matched) {
        return category;
      }
    }

    return {
      label: rules.defaultLabel,
      description: 'Default category',
      keywords: [],
    };
  }
}
