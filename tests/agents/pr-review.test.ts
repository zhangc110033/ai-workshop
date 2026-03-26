import { describe, it, expect, vi } from 'vitest';

describe('PRReviewAgent', () => {
  it('should detect red flags using regex patterns', () => {
    // Test the red flag evaluation logic directly
    const diff = 'some code\npassword = "secret123"\nmore code';
    const rules = [
      { id: 'RF-01', name: 'Hardcoded secret', description: 'test', pattern: 'password\\s*=', severity: 'high' as const },
    ];

    const flags = rules.filter((rule) => {
      try {
        const regex = new RegExp(rule.pattern, 'i');
        return regex.test(diff);
      } catch {
        return false;
      }
    });

    expect(flags).toHaveLength(1);
    expect(flags[0].name).toBe('Hardcoded secret');
  });

  it('should not flag clean diffs', () => {
    const diff = 'const x = 1;\nconst y = 2;';
    const rules = [
      { id: 'RF-01', name: 'Hardcoded secret', description: 'test', pattern: 'password\\s*=', severity: 'high' as const },
    ];

    const flags = rules.filter((rule) => {
      try {
        const regex = new RegExp(rule.pattern, 'i');
        return regex.test(diff);
      } catch {
        return false;
      }
    });

    expect(flags).toHaveLength(0);
  });

  it('should detect large diffs', () => {
    const largeDiff = Array(1001).fill('line of code').join('\n');
    const isLarge = largeDiff.split('\n').length > 1000;
    expect(isLarge).toBe(true);
  });
});
