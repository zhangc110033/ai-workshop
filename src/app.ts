import { logger } from './utils/logger';
import { ConfigService } from './services/config';
import { GitHubService } from './services/github';
import { AuditService } from './services/audit';
import { RuleEngine } from './rules/engine';
import { PRReviewAgent } from './agents/pr-review';
import { IssueReplyAgent } from './agents/issue-reply';
import { IssueLabelAgent } from './agents/issue-label';
import { Scheduler } from './scheduler/scheduler';

let scheduler: Scheduler | null = null;
let auditService: AuditService | null = null;

async function bootstrap(): Promise<void> {
  logger.info('AI Workshop starting...');

  // 1. Validate configuration
  const configService = new ConfigService();
  const config = configService.validate();

  // 2. Load rules
  const ruleEngine = new RuleEngine(config.rulesDir);
  await ruleEngine.loadRules();

  // 3. Initialize audit service
  auditService = new AuditService(config.databaseUrl, config.operatorEmail, config.repoSlug);
  await auditService.initialize();

  // 4. Initialize GitHub service and verify auth
  const githubService = new GitHubService(config.repoSlug);
  await githubService.verifyAuth();

  // 5. Create agents
  const prReviewAgent = new PRReviewAgent(githubService, ruleEngine, auditService);
  const issueReplyAgent = new IssueReplyAgent(githubService, ruleEngine, auditService);
  const issueLabelAgent = new IssueLabelAgent(githubService, ruleEngine, auditService);

  // 6. Start scheduler
  scheduler = new Scheduler(config.cronSchedule, prReviewAgent, issueReplyAgent, issueLabelAgent);
  scheduler.start();

  logger.info({ repoSlug: config.repoSlug, schedule: config.cronSchedule }, 'AI Workshop started');
}

async function shutdown(): Promise<void> {
  logger.info('Shutting down...');

  if (scheduler) {
    scheduler.stop();
  }

  // Wait for in-flight tasks
  if (scheduler?.isRunning()) {
    logger.info('Waiting for in-flight tasks...');
    const timeout = 30000;
    const start = Date.now();
    while (scheduler.isRunning() && Date.now() - start < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  if (auditService) {
    await auditService.close();
  }

  logger.info('Shutdown complete');
  process.exit(0);
}

// Global error handlers
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  shutdown().catch(() => process.exit(1));
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection');
  shutdown().catch(() => process.exit(1));
});

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());

// Start
bootstrap().catch((err) => {
  logger.fatal({ err }, 'Failed to start AI Workshop');
  process.exit(1);
});
