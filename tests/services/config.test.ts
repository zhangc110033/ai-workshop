import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigService } from '../../src/services/config';

describe('ConfigService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should validate when all required env vars are present', () => {
    process.env.REPOSITORY_URL = 'git@github.com:owner/repo.git';
    process.env.OPERATOR_EMAIL = 'test@example.com';
    process.env.DATABASE_URL = 'mysql://localhost/test';

    const config = new ConfigService();
    const result = config.validate();

    expect(result.repoSlug).toBe('owner/repo');
    expect(result.operatorEmail).toBe('test@example.com');
  });

  it('should throw when REPOSITORY_URL is missing', () => {
    process.env.OPERATOR_EMAIL = 'test@example.com';
    process.env.DATABASE_URL = 'mysql://localhost/test';
    delete process.env.REPOSITORY_URL;

    const config = new ConfigService();
    expect(() => config.validate()).toThrow('Missing required environment variables: REPOSITORY_URL');
  });

  it('should parse SSH format REPOSITORY_URL', () => {
    process.env.REPOSITORY_URL = 'git@github.com:tidbcloud/dbaas-ui.git';
    process.env.OPERATOR_EMAIL = 'test@example.com';
    process.env.DATABASE_URL = 'mysql://localhost/test';

    const config = new ConfigService();
    const result = config.validate();
    expect(result.repoSlug).toBe('tidbcloud/dbaas-ui');
  });

  it('should parse HTTPS format REPOSITORY_URL', () => {
    process.env.REPOSITORY_URL = 'https://github.com/tidbcloud/dbaas-ui';
    process.env.OPERATOR_EMAIL = 'test@example.com';
    process.env.DATABASE_URL = 'mysql://localhost/test';

    const config = new ConfigService();
    const result = config.validate();
    expect(result.repoSlug).toBe('tidbcloud/dbaas-ui');
  });

  it('should use default cron schedule when not specified', () => {
    process.env.REPOSITORY_URL = 'git@github.com:owner/repo.git';
    process.env.OPERATOR_EMAIL = 'test@example.com';
    process.env.DATABASE_URL = 'mysql://localhost/test';

    const config = new ConfigService();
    const result = config.validate();
    expect(result.cronSchedule).toBe('*/10 * * * *');
  });
});
