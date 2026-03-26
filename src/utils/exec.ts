import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ExecResult {
  stdout: string;
  stderr: string;
}

export async function execCommand(
  command: string,
  options: { timeout?: number; cwd?: string } = {}
): Promise<ExecResult> {
  const { timeout = 30000, cwd } = options;

  const result = await execAsync(command, {
    timeout,
    cwd,
    maxBuffer: 10 * 1024 * 1024,
  });

  return { stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}
