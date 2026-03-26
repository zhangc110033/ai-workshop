"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleEngine = void 0;
const path = __importStar(require("path"));
const logger_1 = require("../utils/logger");
const parser_1 = require("./parser");
const log = (0, logger_1.createChildLogger)({ service: 'rule-engine' });
class RuleEngine {
    rulesDir;
    prReviewRules = null;
    spamDetectionRules = null;
    issueLabelingRules = null;
    constructor(rulesDir) {
        this.rulesDir = rulesDir;
    }
    async loadRules() {
        this.loadPRReviewRules();
        this.loadSpamDetectionRules();
        this.loadIssueLabelingRules();
        log.info({ rulesDir: this.rulesDir }, 'All rules loaded');
    }
    loadPRReviewRules() {
        try {
            const content = (0, parser_1.loadMarkdownFile)(path.join(this.rulesDir, 'pr-review-rules.md'));
            this.prReviewRules = (0, parser_1.parsePRReviewRules)(content);
            log.info({ count: this.prReviewRules.redFlags.length }, 'PR review rules loaded');
        }
        catch (err) {
            if (this.prReviewRules) {
                log.warn({ err }, 'Failed to reload PR review rules, using cached version');
            }
            else {
                throw new Error(`Failed to load PR review rules: ${err}`);
            }
        }
    }
    loadSpamDetectionRules() {
        try {
            const content = (0, parser_1.loadMarkdownFile)(path.join(this.rulesDir, 'spam-detection-rules.md'));
            this.spamDetectionRules = (0, parser_1.parseSpamDetectionRules)(content);
            log.info({ count: this.spamDetectionRules.indicators.length }, 'Spam detection rules loaded');
        }
        catch (err) {
            if (this.spamDetectionRules) {
                log.warn({ err }, 'Failed to reload spam detection rules, using cached version');
            }
            else {
                throw new Error(`Failed to load spam detection rules: ${err}`);
            }
        }
    }
    loadIssueLabelingRules() {
        try {
            const content = (0, parser_1.loadMarkdownFile)(path.join(this.rulesDir, 'issue-labeling-rules.md'));
            this.issueLabelingRules = (0, parser_1.parseIssueLabelingRules)(content);
            log.info({ count: this.issueLabelingRules.categories.length }, 'Issue labeling rules loaded');
        }
        catch (err) {
            if (this.issueLabelingRules) {
                log.warn({ err }, 'Failed to reload issue labeling rules, using cached version');
            }
            else {
                throw new Error(`Failed to load issue labeling rules: ${err}`);
            }
        }
    }
    getPRReviewRules() {
        if (!this.prReviewRules)
            throw new Error('PR review rules not loaded');
        return this.prReviewRules;
    }
    getSpamDetectionRules() {
        if (!this.spamDetectionRules)
            throw new Error('Spam detection rules not loaded');
        return this.spamDetectionRules;
    }
    getIssueLabelingRules() {
        if (!this.issueLabelingRules)
            throw new Error('Issue labeling rules not loaded');
        return this.issueLabelingRules;
    }
}
exports.RuleEngine = RuleEngine;
//# sourceMappingURL=engine.js.map