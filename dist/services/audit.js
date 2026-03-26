"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const logger_1 = require("../utils/logger");
const log = (0, logger_1.createChildLogger)({ service: 'audit' });
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
class AuditService {
    databaseUrl;
    operatorEmail;
    targetRepo;
    pool = null;
    constructor(databaseUrl, operatorEmail, targetRepo) {
        this.databaseUrl = databaseUrl;
        this.operatorEmail = operatorEmail;
        this.targetRepo = targetRepo;
    }
    async initialize() {
        this.pool = promise_1.default.createPool({
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
    async log(entry) {
        if (!this.pool)
            throw new Error('AuditService not initialized');
        try {
            await this.pool.execute(`INSERT INTO audit_logs (operation_time, operation_type, operation_log, operator_email, target_repo, target_id)
         VALUES (?, ?, ?, ?, ?, ?)`, [
                entry.operationTime,
                entry.operationType,
                entry.operationLog,
                this.operatorEmail,
                this.targetRepo,
                entry.targetId,
            ]);
        }
        catch (err) {
            log.error({ err, entry }, 'Failed to write audit log');
        }
    }
    async close() {
        if (this.pool) {
            await this.pool.end();
            log.info('Database connection closed');
        }
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit.js.map