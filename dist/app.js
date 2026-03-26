"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./utils/logger");
const config_1 = require("./services/config");
const github_1 = require("./services/github");
const audit_1 = require("./services/audit");
const engine_1 = require("./rules/engine");
const pr_review_1 = require("./agents/pr-review");
const issue_reply_1 = require("./agents/issue-reply");
const issue_label_1 = require("./agents/issue-label");
const scheduler_1 = require("./scheduler/scheduler");
let scheduler = null;
let auditService = null;
async function bootstrap() {
    logger_1.logger.info('AI Workshop starting...');
    // 1. Validate configuration
    const configService = new config_1.ConfigService();
    const config = configService.validate();
    // 2. Load rules
    const ruleEngine = new engine_1.RuleEngine(config.rulesDir);
    await ruleEngine.loadRules();
    // 3. Initialize audit service
    auditService = new audit_1.AuditService(config.databaseUrl, config.operatorEmail, config.repoSlug);
    await auditService.initialize();
    // 4. Initialize GitHub service and verify auth
    const githubService = new github_1.GitHubService(config.repoSlug);
    await githubService.verifyAuth();
    // 5. Create agents
    const prReviewAgent = new pr_review_1.PRReviewAgent(githubService, ruleEngine, auditService);
    const issueReplyAgent = new issue_reply_1.IssueReplyAgent(githubService, ruleEngine, auditService);
    const issueLabelAgent = new issue_label_1.IssueLabelAgent(githubService, ruleEngine, auditService);
    // 6. Start scheduler
    scheduler = new scheduler_1.Scheduler(config.cronSchedule, prReviewAgent, issueReplyAgent, issueLabelAgent);
    scheduler.start();
    logger_1.logger.info({ repoSlug: config.repoSlug, schedule: config.cronSchedule }, 'AI Workshop started');
}
async function shutdown() {
    logger_1.logger.info('Shutting down...');
    if (scheduler) {
        scheduler.stop();
    }
    // Wait for in-flight tasks
    if (scheduler?.isRunning()) {
        logger_1.logger.info('Waiting for in-flight tasks...');
        const timeout = 30000;
        const start = Date.now();
        while (scheduler.isRunning() && Date.now() - start < timeout) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }
    if (auditService) {
        await auditService.close();
    }
    logger_1.logger.info('Shutdown complete');
    process.exit(0);
}
// Global error handlers
process.on('uncaughtException', (err) => {
    logger_1.logger.fatal({ err }, 'Uncaught exception');
    shutdown().catch(() => process.exit(1));
});
process.on('unhandledRejection', (reason) => {
    logger_1.logger.fatal({ reason }, 'Unhandled rejection');
    shutdown().catch(() => process.exit(1));
});
process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
// Start
bootstrap().catch((err) => {
    logger_1.logger.fatal({ err }, 'Failed to start AI Workshop');
    process.exit(1);
});
//# sourceMappingURL=app.js.map