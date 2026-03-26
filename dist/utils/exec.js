"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execCommand = execCommand;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function execCommand(command, options = {}) {
    const { timeout = 30000, cwd } = options;
    const result = await execAsync(command, {
        timeout,
        cwd,
        maxBuffer: 10 * 1024 * 1024,
    });
    return { stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}
//# sourceMappingURL=exec.js.map