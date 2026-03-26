export interface RedFlagRule {
    id: string;
    name: string;
    description: string;
    pattern: string;
    severity: 'high' | 'medium' | 'low';
}
export interface PRReviewRules {
    redFlags: RedFlagRule[];
}
export interface SpamIndicator {
    id: string;
    name: string;
    pattern: string;
    weight: number;
}
export interface SpamDetectionRules {
    indicators: SpamIndicator[];
    threshold: number;
}
export interface LabelCategory {
    label: string;
    description: string;
    keywords: string[];
}
export interface IssueLabelingRules {
    categories: LabelCategory[];
    defaultLabel: string;
}
export declare function parsePRReviewRules(content: string): PRReviewRules;
export declare function parseSpamDetectionRules(content: string): SpamDetectionRules;
export declare function parseIssueLabelingRules(content: string): IssueLabelingRules;
export declare function loadMarkdownFile(filePath: string): string;
//# sourceMappingURL=parser.d.ts.map