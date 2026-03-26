"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../utils/logger");
const log = (0, logger_1.createChildLogger)({ service: 'scheduler' });
class Scheduler {
    cronSchedule;
    prReviewAgent;
    issueReplyAgent;
    issueLabelAgent;
    task = null;
    running = false;
    constructor(cronSchedule, prReviewAgent, issueReplyAgent, issueLabelAgent) {
        this.cronSchedule = cronSchedule;
        this.prReviewAgent = prReviewAgent;
        this.issueReplyAgent = issueReplyAgent;
        this.issueLabelAgent = issueLabelAgent;
    }
    start() {
        this.task = node_cron_1.default.schedule(this.cronSchedule, () => {
            this.runAll();
        });
        log.info({ schedule: this.cronSchedule }, 'Scheduler started');
    }
    stop() {
        if (this.task) {
            this.task.stop();
            this.task = null;
        }
        log.info('Scheduler stopped');
    }
    isRunning() {
        return this.running;
    }
    async runAll() {
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
                }
                else {
                    log.error({ agent: agentNames[index], error: result.reason }, 'Agent failed');
                }
            });
        }
        finally {
            this.running = false;
            const duration = Date.now() - startTime;
            log.info({ durationMs: duration }, 'Scheduled run completed');
        }
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=scheduler.js.map