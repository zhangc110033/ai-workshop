"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueReplyAgent = void 0;
const logger_1 = require("../utils/logger");
const log = (0, logger_1.createChildLogger)({ agent: 'issue-reply' });
const COMMENT_PREFIX = 'from AI Workshop: ';
const MAX_ISSUES_PER_RUN = 3;
class IssueReplyAgent {
    github;
    rules;
    audit;
    constructor(github, rules, audit) {
        this.github = github;
        this.rules = rules;
        this.audit = audit;
    }
    async execute() {
        log.info('Starting issue reply scan');
        const issues = await this.github.listOpenIssues();
        // Filter out already-processed issues
        const unprocessed = [];
        for (const issue of issues) {
            const comments = await this.github.getIssueComments(issue.number);
            const alreadyReplied = comments.some((c) => c.body.startsWith(COMMENT_PREFIX));
            if (!alreadyReplied) {
                unprocessed.push(issue);
            }
            if (unprocessed.length >= MAX_ISSUES_PER_RUN)
                break;
        }
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
        const results = [];
        for (const issue of unprocessed) {
            try {
                const result = await this.processIssue(issue, spamRules, repoContext);
                results.push(result);
            }
            catch (err) {
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
    async processIssue(issue, spamRules, repoContext) {
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
        await this.audit.log({
            operationTime: new Date(),
            operationType: 'issue_reply',
            operationLog: JSON.stringify({ issueNumber: issue.number, reply: reply.substring(0, 200) }),
            targetId: issue.number,
        });
        return { issueNumber: issue.number, action: 'replied', isSpam: false, comment };
    }
    evaluateSpam(issue, rules) {
        let score = 0;
        const content = `${issue.title} ${issue.body}`.toLowerCase();
        for (const indicator of rules.indicators) {
            try {
                const regex = new RegExp(indicator.pattern, 'i');
                if (regex.test(content)) {
                    score += indicator.weight;
                }
            }
            catch {
                log.warn({ indicatorId: indicator.id }, 'Invalid spam pattern');
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
    generateReply(issue, repoContext) {
        const repoName = repoContext.name;
        const lang = repoContext.primaryLanguage?.name || 'this project';
        const topics = repoContext.repositoryTopics?.map((t) => t.name).join(', ') || '';
        const lines = [
            `Thank you for opening this issue on **${repoName}**.`,
            '',
        ];
        if (issue.title.toLowerCase().includes('bug') || issue.body?.toLowerCase().includes('error')) {
            lines.push('This appears to be a bug report. The team will investigate and get back to you.', 'In the meantime, please ensure you have provided:', '- Steps to reproduce', '- Expected vs actual behavior', '- Environment details (OS, version, etc.)');
        }
        else if (issue.title.toLowerCase().includes('feature') || issue.body?.toLowerCase().includes('request')) {
            lines.push('This looks like a feature request. The team will review it and assess feasibility.', `This project focuses on ${topics || lang}, so please ensure the request aligns with the project scope.`);
        }
        else {
            lines.push('The team will review this issue and respond as soon as possible.', `This project (${lang}) is actively maintained. You can check the README for more context.`);
        }
        return lines.join('\n');
    }
}
exports.IssueReplyAgent = IssueReplyAgent;
//# sourceMappingURL=issue-reply.js.map