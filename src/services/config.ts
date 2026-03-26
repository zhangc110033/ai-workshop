import * as dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

export interface AppConfig {
  repositoryUrl: string;
  repoSlug: string;
  operatorEmail: string;
  databaseUrl: string;
  cronSchedule: string;
  rulesDir: string;
}

function parseRepoSlug(url: string): string {
  // SSH format: git@github.com:owner/repo.git
  const sshMatch = url.match(/git@github\.com:(.+?)(?:\.git)?$/);
  if (sshMatch) return sshMatch[1];

  // HTTPS format: https://github.com/owner/repo
  const httpsMatch = url.match(/github\.com\/(.+?)(?:\.git)?$/);
  if (httpsMatch) return httpsMatch[1];

  throw new Error(`Cannot parse REPOSITORY_URL: ${url}`);
}

export class ConfigService {
  private config: AppConfig | null = null;

  validate(): AppConfig {
    const repositoryUrl = process.env.REPOSITORY_URL;
    const operatorEmail = process.env.OPERATOR_EMAIL;
    const databaseUrl = process.env.DATABASE_URL;

    const missing: string[] = [];
    if (!repositoryUrl) missing.push('REPOSITORY_URL');
    if (!operatorEmail) missing.push('OPERATOR_EMAIL');
    if (!databaseUrl) missing.push('DATABASE_URL');

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    this.config = {
      repositoryUrl: repositoryUrl!,
      repoSlug: parseRepoSlug(repositoryUrl!),
      operatorEmail: operatorEmail!,
      databaseUrl: databaseUrl!,
      cronSchedule: process.env.CRON_SCHEDULE || '*/10 * * * *',
      rulesDir: process.env.RULES_DIR || './rules',
    };

    logger.info({ repoSlug: this.config.repoSlug }, 'Configuration validated');
    return this.config;
  }

  get(key: keyof AppConfig): string {
    if (!this.config) throw new Error('ConfigService not initialized. Call validate() first.');
    return this.config[key];
  }

  getAll(): AppConfig {
    if (!this.config) throw new Error('ConfigService not initialized. Call validate() first.');
    return this.config;
  }
}
