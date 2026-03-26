export interface RetryOptions {
    maxRetries?: number;
    baseDelay?: number;
    retryOn?: (err: Error) => boolean;
}
export declare function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
//# sourceMappingURL=retry.d.ts.map