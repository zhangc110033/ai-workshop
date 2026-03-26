"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const dotenv = __importStar(require("dotenv"));
const logger_1 = require("../utils/logger");
dotenv.config();
function parseRepoSlug(url) {
    // SSH format: git@github.com:owner/repo.git
    const sshMatch = url.match(/git@github\.com:(.+?)(?:\.git)?$/);
    if (sshMatch)
        return sshMatch[1];
    // HTTPS format: https://github.com/owner/repo
    const httpsMatch = url.match(/github\.com\/(.+?)(?:\.git)?$/);
    if (httpsMatch)
        return httpsMatch[1];
    throw new Error(`Cannot parse REPOSITORY_URL: ${url}`);
}
class ConfigService {
    config = null;
    validate() {
        const repositoryUrl = process.env.REPOSITORY_URL;
        const operatorEmail = process.env.OPERATOR_EMAIL;
        const databaseUrl = process.env.DATABASE_URL;
        const missing = [];
        if (!repositoryUrl)
            missing.push('REPOSITORY_URL');
        if (!operatorEmail)
            missing.push('OPERATOR_EMAIL');
        if (!databaseUrl)
            missing.push('DATABASE_URL');
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
        this.config = {
            repositoryUrl: repositoryUrl,
            repoSlug: parseRepoSlug(repositoryUrl),
            operatorEmail: operatorEmail,
            databaseUrl: databaseUrl,
            cronSchedule: process.env.CRON_SCHEDULE || '*/10 * * * *',
            rulesDir: process.env.RULES_DIR || './rules',
        };
        logger_1.logger.info({ repoSlug: this.config.repoSlug }, 'Configuration validated');
        return this.config;
    }
    get(key) {
        if (!this.config)
            throw new Error('ConfigService not initialized. Call validate() first.');
        return this.config[key];
    }
    getAll() {
        if (!this.config)
            throw new Error('ConfigService not initialized. Call validate() first.');
        return this.config;
    }
}
exports.ConfigService = ConfigService;
//# sourceMappingURL=config.js.map