"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = withRetry;
const logger_1 = require("./logger");
async function withRetry(fn, options = {}) {
    const { maxRetries = 3, baseDelay = 1000, retryOn } = options;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            if (attempt === maxRetries) {
                throw error;
            }
            if (retryOn && !retryOn(error)) {
                throw error;
            }
            const delay = baseDelay * Math.pow(2, attempt);
            logger_1.logger.warn({ attempt: attempt + 1, maxRetries, delay, error: error.message }, 'Retrying after error');
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw new Error('Unreachable');
}
//# sourceMappingURL=retry.js.map