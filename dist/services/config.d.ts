export interface AppConfig {
    repositoryUrl: string;
    repoSlug: string;
    operatorEmail: string;
    databaseUrl: string;
    cronSchedule: string;
    rulesDir: string;
}
export declare class ConfigService {
    private config;
    validate(): AppConfig;
    get(key: keyof AppConfig): string;
    getAll(): AppConfig;
}
//# sourceMappingURL=config.d.ts.map