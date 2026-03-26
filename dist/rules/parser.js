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
exports.parsePRReviewRules = parsePRReviewRules;
exports.parseSpamDetectionRules = parseSpamDetectionRules;
exports.parseIssueLabelingRules = parseIssueLabelingRules;
exports.loadMarkdownFile = loadMarkdownFile;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function parseSection(content, sectionName) {
    const regex = new RegExp(`## ${sectionName}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
}
function parseTableRows(tableContent) {
    const lines = tableContent.split('\n').filter((l) => l.trim().startsWith('|'));
    if (lines.length < 3)
        return [];
    return lines.slice(2).map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
}
function parsePRReviewRules(content) {
    const section = parseSection(content, 'Red Flags') || content;
    const rows = parseTableRows(section);
    const redFlags = rows.map((row, i) => ({
        id: `RF-${String(i + 1).padStart(2, '0')}`,
        name: row[0] || '',
        description: row[1] || '',
        pattern: row[2] || '',
        severity: row[3] || 'medium',
    }));
    return { redFlags };
}
function parseSpamDetectionRules(content) {
    const section = parseSection(content, 'Indicators') || content;
    const rows = parseTableRows(section);
    const indicators = rows.map((row, i) => ({
        id: `SPAM-${String(i + 1).padStart(2, '0')}`,
        name: row[0] || '',
        pattern: row[1] || '',
        weight: parseInt(row[2] || '1', 10),
    }));
    const thresholdMatch = content.match(/threshold:\s*(\d+)/i);
    const threshold = thresholdMatch ? parseInt(thresholdMatch[1], 10) : 3;
    return { indicators, threshold };
}
function parseIssueLabelingRules(content) {
    const section = parseSection(content, 'Categories') || content;
    const rows = parseTableRows(section);
    const categories = rows.map((row) => ({
        label: row[0] || '',
        description: row[1] || '',
        keywords: (row[2] || '').split(',').map((k) => k.trim().toLowerCase()).filter(Boolean),
    }));
    const defaultMatch = content.match(/default[- ]label:\s*(.+)/i);
    const defaultLabel = defaultMatch ? defaultMatch[1].trim() : 'triage';
    return { categories, defaultLabel };
}
function loadMarkdownFile(filePath) {
    return fs.readFileSync(path.resolve(filePath), 'utf-8');
}
//# sourceMappingURL=parser.js.map