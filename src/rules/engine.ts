import * as path from 'path';
import { createChildLogger } from '../utils/logger';
import {
  loadMarkdownFile,
  parsePRReviewRules,
  parseSpamDetectionRules,
  parseIssueLabelingRules,
  type PRReviewRules,
  type SpamDetectionRules,
  type IssueLabelingRules,
} from './parser';

const log = createChildLogger({ service: 'rule-engine' });

export class RuleEngine {
  private prReviewRules: PRReviewRules | null = null;
  private spamDetectionRules: SpamDetectionRules | null = null;
  private issueLabelingRules: IssueLabelingRules | null = null;

  constructor(private rulesDir: string) {}

  async loadRules(): Promise<void> {
    this.loadPRReviewRules();
    this.loadSpamDetectionRules();
    this.loadIssueLabelingRules();
    log.info({ rulesDir: this.rulesDir }, 'All rules loaded');
  }

  private loadPRReviewRules(): void {
    try {
      const content = loadMarkdownFile(path.join(this.rulesDir, 'pr-review-rules.md'));
      this.prReviewRules = parsePRReviewRules(content);
      log.info({ count: this.prReviewRules.redFlags.length }, 'PR review rules loaded');
    } catch (err) {
      if (this.prReviewRules) {
        log.warn({ err }, 'Failed to reload PR review rules, using cached version');
      } else {
        throw new Error(`Failed to load PR review rules: ${err}`);
      }
    }
  }

  private loadSpamDetectionRules(): void {
    try {
      const content = loadMarkdownFile(path.join(this.rulesDir, 'spam-detection-rules.md'));
      this.spamDetectionRules = parseSpamDetectionRules(content);
      log.info({ count: this.spamDetectionRules.indicators.length }, 'Spam detection rules loaded');
    } catch (err) {
      if (this.spamDetectionRules) {
        log.warn({ err }, 'Failed to reload spam detection rules, using cached version');
      } else {
        throw new Error(`Failed to load spam detection rules: ${err}`);
      }
    }
  }

  private loadIssueLabelingRules(): void {
    try {
      const content = loadMarkdownFile(path.join(this.rulesDir, 'issue-labeling-rules.md'));
      this.issueLabelingRules = parseIssueLabelingRules(content);
      log.info({ count: this.issueLabelingRules.categories.length }, 'Issue labeling rules loaded');
    } catch (err) {
      if (this.issueLabelingRules) {
        log.warn({ err }, 'Failed to reload issue labeling rules, using cached version');
      } else {
        throw new Error(`Failed to load issue labeling rules: ${err}`);
      }
    }
  }

  getPRReviewRules(): PRReviewRules {
    if (!this.prReviewRules) throw new Error('PR review rules not loaded');
    return this.prReviewRules;
  }

  getSpamDetectionRules(): SpamDetectionRules {
    if (!this.spamDetectionRules) throw new Error('Spam detection rules not loaded');
    return this.spamDetectionRules;
  }

  getIssueLabelingRules(): IssueLabelingRules {
    if (!this.issueLabelingRules) throw new Error('Issue labeling rules not loaded');
    return this.issueLabelingRules;
  }
}
