# Logical Components — AI Workshop

## LC-01: Logger (pino)
- **类型**: 横切关注点
- **职责**: 结构化 JSON 日志
- **配置**:
  ```typescript
  const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  });
  ```
- **子 logger**: `logger.child({ agent: 'pr-review' })`

## LC-02: Retry Utility
- **类型**: 基础设施工具
- **职责**: 为外部调用提供重试能力
- **接口**:
  ```typescript
  async function withRetry<T>(
    fn: () => Promise<T>,
    options?: { maxRetries?: number; baseDelay?: number; retryOn?: (err: Error) => boolean }
  ): Promise<T>
  ```

## LC-03: MySQL Connection Pool
- **类型**: 数据访问
- **职责**: 管理 TiDB 连接
- **配置**: mysql2.createPool with ssl: true, connectionLimit: 5
- **生命周期**: App.bootstrap() 创建，App.shutdown() 销毁

## LC-04: CLI Executor
- **类型**: 外部集成工具
- **职责**: 封装 child_process.exec，提供超时和错误处理
- **接口**:
  ```typescript
  async function execCommand(
    command: string,
    options?: { timeout?: number; cwd?: string }
  ): Promise<{ stdout: string; stderr: string }>
  ```
- **超时**: 默认 30 秒

## LC-05: Rule Parser
- **类型**: 配置解析
- **职责**: 将 Markdown 规则文件解析为结构化数据
- **接口**:
  ```typescript
  function parsePRReviewRules(markdown: string): PRReviewRules
  function parseSpamDetectionRules(markdown: string): SpamDetectionRules
  function parseIssueLabelingRules(markdown: string): IssueLabelingRules
  ```

## Component Interaction Map

```
+----------+     +----------+     +----------+
|  Logger  |     |  Retry   |     |  CLI     |
| (pino)   |     |  Utility |     | Executor |
+----+-----+     +----+-----+     +----+-----+
     |                |                |
     v                v                v
+----+----------------+----------------+-----+
|              GitHubService                  |
+---------------------------------------------+
     |
     v
+----+-----+     +----------+
|  Agents  |---->|  Rule    |
|          |     |  Parser  |
+----+-----+     +----------+
     |
     v
+----+-----+
|  Audit   |---> LC-03: MySQL Pool
|  Service |
+----------+
```
