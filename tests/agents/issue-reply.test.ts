import { describe, it, expect } from 'vitest';

describe('IssueReplyAgent - SPAM Detection', () => {
  const spamRules = {
    indicators: [
      { id: 'SPAM-01', name: 'Ad links', pattern: 'buy now|click here', weight: 3 },
      { id: 'SPAM-02', name: 'Crypto', pattern: 'bitcoin|airdrop', weight: 2 },
    ],
    threshold: 3,
  };

  function evaluateSpam(title: string, body: string): number {
    let score = 0;
    const content = `${title} ${body}`.toLowerCase();

    for (const indicator of spamRules.indicators) {
      try {
        const regex = new RegExp(indicator.pattern, 'i');
        if (regex.test(content)) {
          score += indicator.weight;
        }
      } catch {
        // skip invalid pattern
      }
    }

    if (!body || body.trim().length < 10) score += 2;

    const urlCount = (content.match(/https?:\/\//g) || []).length;
    if (urlCount > 3) score += 2;

    return score;
  }

  it('should detect spam with advertising keywords', () => {
    const score = evaluateSpam('Great offer', 'Buy now and click here for deals');
    expect(score).toBeGreaterThanOrEqual(spamRules.threshold);
  });

  it('should not flag legitimate issues', () => {
    const score = evaluateSpam(
      'Bug: login page crashes',
      'When I try to login with my credentials, the page crashes with a 500 error. Steps to reproduce: 1. Go to login page 2. Enter credentials 3. Click submit'
    );
    expect(score).toBeLessThan(spamRules.threshold);
  });

  it('should flag empty body issues', () => {
    const score = evaluateSpam('test', '');
    expect(score).toBeGreaterThanOrEqual(2);
  });

  it('should flag issues with excessive links', () => {
    const score = evaluateSpam(
      'Check these',
      'https://a.com https://b.com https://c.com https://d.com'
    );
    expect(score).toBeGreaterThanOrEqual(2);
  });
});
