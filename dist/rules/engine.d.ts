import { type PRReviewRules, type SpamDetectionRules, type IssueLabelingRules } from './parser';
export declare class RuleEngine {
    private rulesDir;
    private prReviewRules;
    private spamDetectionRules;
    private issueLabelingRules;
    constructor(rulesDir: string);
    loadRules(): Promise<void>;
    private loadPRReviewRules;
    private loadSpamDetectionRules;
    private loadIssueLabelingRules;
    getPRReviewRules(): PRReviewRules;
    getSpamDetectionRules(): SpamDetectionRules;
    getIssueLabelingRules(): IssueLabelingRules;
}
//# sourceMappingURL=engine.d.ts.map