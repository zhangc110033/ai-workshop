import { describe, it, expect } from 'vitest';
import type { LabelCategory, IssueLabelingRules } from '../../src/rules/parser';

describe('IssueLabelAgent - Classification', () => {
  const rules: IssueLabelingRules = {
    categories: [
      { label: 'bug', description: 'Bug report', keywords: ['bug', 'error', 'crash', 'broken'] },
      { label: 'feature', description: 'Feature request', keywords: ['feature', 'request', 'enhancement', 'add'] },
      { label: 'question', description: 'Question', keywords: ['question', 'how to', 'help'] },
    ],
    defaultLabel: 'triage',
  };

  function classifyIssue(title: string, body: string): LabelCategory {
    const content = `${title} ${body}`.toLowerCase();
    for (const category of rules.categories) {
      const matched = category.keywords.some((keyword) => content.includes(keyword));
      if (matched) return category;
    }
    return { label: rules.defaultLabel, description: 'Default', keywords: [] };
  }

  it('should classify bug reports', () => {
    const result = classifyIssue('App crashes on startup', 'There is a bug when loading');
    expect(result.label).toBe('bug');
  });

  it('should classify feature requests', () => {
    const result = classifyIssue('Add dark mode', 'Feature request for dark mode support');
    expect(result.label).toBe('feature');
  });

  it('should classify questions', () => {
    const result = classifyIssue('How to configure', 'I have a question about setup');
    expect(result.label).toBe('question');
  });

  it('should use default label for unclassifiable issues', () => {
    const result = classifyIssue('Something', 'Some content that does not match any category');
    expect(result.label).toBe('triage');
  });

  it('should match first category when multiple match', () => {
    const result = classifyIssue('Bug feature', 'This is a bug and also a feature request');
    expect(result.label).toBe('bug'); // bug comes first in categories
  });
});
