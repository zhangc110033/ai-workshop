import cron from 'node-cron';
import { createChildLogger } from '../utils/logger';
import { PRReviewAgent } from '../agents/pr-review';
import { IssueReplyAgent } from '../agents/issue-reply';
import { IssueLabelAgent } from '../agents/issue-label';

const log = createChildLogger({ service: 'scheduler' });

export class Scheduler {
  private task: cron.ScheduledTask | null = null;
  private running = false;

  constructor(
    private cronSchedule: string,
    private prReviewAgent: PRReviewAgent,
    private issueReplyAgent: IssueReplyAgent,
    private issueLabelAgent: IssueLabelAgent
  ) {}

  start(): void {
    this.task = cron.schedule(this.cronSchedule, () => {
      this.runAll();
    });
    log.info({ schedule: this.cronSchedule }, 'Scheduler started');
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
    }
    log.info('Scheduler stopped');
  }

  isRunning(): boolean {
    return this.running;
  }

  async runAll(): Promise<void> {
    if (this.running) {
      log.warn('Previous run still in progress, skipping');
      return;
    }

    this.running = true;
    const startTime = Date.now();
    log.info('Scheduled run started');

    try {
      const results = await Promise.allSettled([
        this.prReviewAgent.execute(),
        this.issueReplyAgent.execute(),
        this.issueLabelAgent.execute(),
      ]);

      results.forEach((result, index) => {
        const agentNames = ['PRReviewAgent', 'IssueReplyAgent', 'IssueLabelAgent'];
        if (result.status === 'fulfilled') {
          log.info({ agent: agentNames[index], resultCount: result.value.length }, 'Agent completed');
        } else {
          log.error({ agent: agentNames[index], error: result.reason }, 'Agent failed');
        }
      });
    } finally {
      this.running = false;
      const duration = Date.now() - startTime;
      log.info({ durationMs: duration }, 'Scheduled run completed');
    }
  }
}
