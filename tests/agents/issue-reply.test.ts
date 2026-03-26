import { describe, it, expect } from 'vitest';

describe('IssueReplyAgent - SPAM Detection', () => {
  const spamRules = {
    indicators: [
      { id: 'SPAM-01', name: 'Ad links', keywords: ['bit.ly', 'buy now', 'click here'], weight: 3 },
      { id: 'SPAM-02', name: 'Crypto', keywords: ['bitcoin', 'airdrop', 'crypto'], weight: 2 },
      { id: 'SPAM-03', name: 'Known spam', keywords: ['make money', 'free gift', 'congratulations you won'], weight: 3 },
    ],
    threshold: 3,
  };

  function evaluateSpam(title: string, body: string): number {
    let score = 0;
    const content = `${title} ${body}`.toLowerCase();

    for (const indicator of spamRules.indicators) {
      const matched = indicator.keywords.some((keyword) => content.includes(keyword));
      if (matched) {
        score += indicator.weight;
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

  it('should detect crypto spam', () => {
    const score = evaluateSpam(
      'FREE CRYPTO AIRDROP - Click here to claim tokens',
      'Congratulations you won! Click here to claim your free bitcoin airdrop tokens now! https://bit.ly/1 https://bit.ly/2 https://bit.ly/3 https://bit.ly/4 Buy now and earn money. Make money online. Free gift!'
    );
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
