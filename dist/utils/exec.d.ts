export interface ExecResult {
    stdout: string;
    stderr: string;
}
export declare function execCommand(command: string, options?: {
    timeout?: number;
    cwd?: string;
}): Promise<ExecResult>;
//# sourceMappingURL=exec.d.ts.map