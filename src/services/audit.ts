import mysql from 'mysql2/promise';
import { createChildLogger } from '../utils/logger';
import type { AuditEntry } from '../types';

const log = createChildLogger({ service: 'audit' });

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operation_time DATETIME NOT NULL,
  operation_type VARCHAR(50) NOT NULL,
  operation_log TEXT NOT NULL,
  operator_email VARCHAR(255) NOT NULL,
  target_repo VARCHAR(500),
  target_id INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

export class AuditService {
  private pool: mysql.Pool | null = null;

  constructor(
    private databaseUrl: string,
    private operatorEmail: string,
    private targetRepo: string
  ) {}

  async initialize(): Promise<void> {
    this.pool = mysql.createPool({
      uri: this.databaseUrl,
      ssl: { rejectUnauthorized: true },
      connectionLimit: 5,
      waitForConnections: true,
    });

    await this.pool.execute('SELECT 1');
    log.info('Database connection verified');

    await this.pool.execute(CREATE_TABLE_SQL);
    log.info('audit_logs table ensured');
  }

  async log(entry: Omit<AuditEntry, 'operatorEmail' | 'targetRepo'>): Promise<void> {
    if (!this.pool) throw new Error('AuditService not initialized');

    try {
      await this.pool.execute(
        `INSERT INTO audit_logs (operation_time, operation_type, operation_log, operator_email, target_repo, target_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          entry.operationTime,
          entry.operationType,
          entry.operationLog,
          this.operatorEmail,
          this.targetRepo,
          entry.targetId,
        ]
      );
    } catch (err) {
      log.error({ err, entry }, 'Failed to write audit log');
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      log.info('Database connection closed');
    }
  }
}
