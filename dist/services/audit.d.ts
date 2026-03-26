import type { AuditEntry } from '../types';
export declare class AuditService {
    private databaseUrl;
    private operatorEmail;
    private targetRepo;
    private pool;
    constructor(databaseUrl: string, operatorEmail: string, targetRepo: string);
    initialize(): Promise<void>;
    log(entry: Omit<AuditEntry, 'operatorEmail' | 'targetRepo'>): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=audit.d.ts.map