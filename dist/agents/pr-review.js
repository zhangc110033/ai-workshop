"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRReviewAgent = void 0;
const logger_1 = require("../utils/logger");
const log = (0, logger_1.createChildLogger)({ agent: 'pr-review' });
const COMMENT_PREFIX = 'from AI Workshop: ';
class PRReviewAgent {
    github;
    rules;
    audit;
    constructor(github, rules, audit) {
        this.github = github;
        this.rules = rules;
        this.audit = audit;
    }
    async execute() {
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
        const results = [];
        for (const pr of prs) {
            try {
                const result = await this.reviewPR(pr.number, pr.title, reviewRules.redFlags);
                results.push(result);
            }
            catch (err) {
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
    async reviewPR(prNumber, prTitle, redFlagRules) {
        const diff = await this.github.getPRDiff(prNumber);
        const redFlags = this.evaluateRedFlags(diff, prTitle, redFlagRules);
        let comment;
        let approve;
        if (redFlags.length === 0) {
            comment = `${COMMENT_PREFIX}PR looks good. No red flags detected. Auto-approved.`;
            approve = true;
        }
        else {
            const flagList = redFlags.map((f) => `- **${f.name}** (${f.severity}): ${f.description}`).join('\n');
            comment = `${COMMENT_PREFIX}Red flags detected:\n${flagList}`;
            approve = false;
        }
        await this.github.reviewPR(prNumber, comment, approve);
        const result = {
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
    evaluateRedFlags(diff, prTitle, rules) {
        const flags = [];
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
            }
            catch {
                log.warn({ ruleId: rule.id, pattern: rule.pattern }, 'Invalid regex pattern in rule');
            }
        }
        return flags;
    }
}
exports.PRReviewAgent = PRReviewAgent;
//# sourceMappingURL=pr-review.js.map