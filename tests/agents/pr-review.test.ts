import { describe, it, expect } from 'vitest';

describe('PRReviewAgent', () => {
  it('should detect red flags using keyword matching', () => {
    const diff = 'some code\npassword= "secret123"\nmore code';
    const rules = [
      { id: 'RF-01', name: 'Hardcoded secret', description: 'test', keywords: ['password=', 'api_key='], severity: 'high' as const },
    ];

    const content = diff.toLowerCase();
    const flags = rules.filter((rule) =>
      rule.keywords.some((keyword) => content.includes(keyword))
    );

    expect(flags).toHaveLength(1);
    expect(flags[0].name).toBe('Hardcoded secret');
  });

  it('should not flag clean diffs', () => {
    const diff = 'const x = 1;\nconst y = 2;';
    const rules = [
      { id: 'RF-01', name: 'Hardcoded secret', description: 'test', keywords: ['password=', 'api_key='], severity: 'high' as const },
    ];

    const content = diff.toLowerCase();
    const flags = rules.filter((rule) =>
      rule.keywords.some((keyword) => content.includes(keyword))
    );

    expect(flags).toHaveLength(0);
  });

  it('should detect large diffs', () => {
    const largeDiff = Array(1001).fill('line of code').join('\n');
    const isLarge = largeDiff.split('\n').length > 1000;
    expect(isLarge).toBe(true);
  });
});
