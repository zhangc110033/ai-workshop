import { describe, it, expect } from 'vitest';
import {
  parsePRReviewRules,
  parseSpamDetectionRules,
  parseIssueLabelingRules,
} from '../../src/rules/parser';

describe('Rule Parser', () => {
  describe('parsePRReviewRules', () => {
    it('should parse red flag rules from markdown table', () => {
      const content = `# PR Review Rules\n\n## Red Flags\n\n| Name | Description | Pattern | Severity |\n|------|-------------|---------|----------|\n| Test rule | A test | test_pattern | high |`;

      const rules = parsePRReviewRules(content);
      expect(rules.redFlags).toHaveLength(1);
      expect(rules.redFlags[0].name).toBe('Test rule');
      expect(rules.redFlags[0].pattern).toBe('test_pattern');
      expect(rules.redFlags[0].severity).toBe('high');
    });

    it('should return empty array for content without table', () => {
      const rules = parsePRReviewRules('# No table here');
      expect(rules.redFlags).toHaveLength(0);
    });
  });

  describe('parseSpamDetectionRules', () => {
    it('should parse spam indicators and threshold', () => {
      const content = `# SPAM Rules\n\nThreshold: 5\n\n## Indicators\n\n| Name | Pattern | Weight |\n|------|---------|--------|\n| Ad links | https://spam | 3 |`;

      const rules = parseSpamDetectionRules(content);
      expect(rules.threshold).toBe(5);
      expect(rules.indicators).toHaveLength(1);
      expect(rules.indicators[0].weight).toBe(3);
    });

    it('should default threshold to 3', () => {
      const content = `## Indicators\n\n| Name | Pattern | Weight |\n|------|---------|--------|\n| Test | test | 1 |`;

      const rules = parseSpamDetectionRules(content);
      expect(rules.threshold).toBe(3);
    });
  });

  describe('parseIssueLabelingRules', () => {
    it('should parse label categories', () => {
      const content = `# Labeling\n\nDefault-label: triage\n\n## Categories\n\n| Label | Description | Keywords |\n|-------|-------------|----------|\n| bug | Bug report | bug, error, crash |`;

      const rules = parseIssueLabelingRules(content);
      expect(rules.defaultLabel).toBe('triage');
      expect(rules.categories).toHaveLength(1);
      expect(rules.categories[0].label).toBe('bug');
      expect(rules.categories[0].keywords).toContain('bug');
      expect(rules.categories[0].keywords).toContain('error');
    });
  });
});
