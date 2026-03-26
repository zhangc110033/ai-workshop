import * as fs from 'fs';
import * as path from 'path';

export interface RedFlagRule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  severity: 'high' | 'medium' | 'low';
}

export interface PRReviewRules {
  redFlags: RedFlagRule[];
}

export interface SpamIndicator {
  id: string;
  name: string;
  pattern: string;
  weight: number;
}

export interface SpamDetectionRules {
  indicators: SpamIndicator[];
  threshold: number;
}

export interface LabelCategory {
  label: string;
  description: string;
  keywords: string[];
}

export interface IssueLabelingRules {
  categories: LabelCategory[];
  defaultLabel: string;
}

function parseSection(content: string, sectionName: string): string {
  const regex = new RegExp(`## ${sectionName}\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function parseTableRows(tableContent: string): string[][] {
  const lines = tableContent.split('\n').filter((l) => l.trim().startsWith('|'));
  if (lines.length < 3) return [];
  return lines.slice(2).map((line) =>
    line.split('|').slice(1, -1).map((cell) => cell.trim())
  );
}

export function parsePRReviewRules(content: string): PRReviewRules {
  const section = parseSection(content, 'Red Flags') || content;
  const rows = parseTableRows(section);

  const redFlags: RedFlagRule[] = rows.map((row, i) => ({
    id: `RF-${String(i + 1).padStart(2, '0')}`,
    name: row[0] || '',
    description: row[1] || '',
    pattern: row[2] || '',
    severity: (row[3] as RedFlagRule['severity']) || 'medium',
  }));

  return { redFlags };
}

export function parseSpamDetectionRules(content: string): SpamDetectionRules {
  const section = parseSection(content, 'Indicators') || content;
  const rows = parseTableRows(section);

  const indicators: SpamIndicator[] = rows.map((row, i) => ({
    id: `SPAM-${String(i + 1).padStart(2, '0')}`,
    name: row[0] || '',
    pattern: row[1] || '',
    weight: parseInt(row[2] || '1', 10),
  }));

  const thresholdMatch = content.match(/threshold:\s*(\d+)/i);
  const threshold = thresholdMatch ? parseInt(thresholdMatch[1], 10) : 3;

  return { indicators, threshold };
}

export function parseIssueLabelingRules(content: string): IssueLabelingRules {
  const section = parseSection(content, 'Categories') || content;
  const rows = parseTableRows(section);

  const categories: LabelCategory[] = rows.map((row) => ({
    label: row[0] || '',
    description: row[1] || '',
    keywords: (row[2] || '').split(',').map((k) => k.trim().toLowerCase()).filter(Boolean),
  }));

  const defaultMatch = content.match(/default[- ]label:\s*(.+)/i);
  const defaultLabel = defaultMatch ? defaultMatch[1].trim() : 'triage';

  return { categories, defaultLabel };
}

export function loadMarkdownFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), 'utf-8');
}
