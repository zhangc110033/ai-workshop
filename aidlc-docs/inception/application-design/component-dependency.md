# Component Dependencies — AI Workshop

## Dependency Matrix

| Component | Depends On |
|-----------|-----------|
| App | ConfigService, AuditService, RuleEngine, GitHubService, Scheduler, All Agents |
| Scheduler | PRReviewAgent, IssueReplyAgent, IssueLabelAgent |
| PRReviewAgent | GitHubService, RuleEngine, AuditService |
| IssueReplyAgent | GitHubService, RuleEngine, AuditService |
| IssueLabelAgent | GitHubService, RuleEngine, AuditService |
| GitHubService | ConfigService |
| AuditService | ConfigService |
| RuleEngine | (filesystem) |
| ConfigService | (environment) |

## Data Flow

```
+------------------+
|       App        |
| (bootstrap/      |
|  shutdown)       |
+--------+---------+
         |
         v
+--------+---------+
|    Scheduler     |
| (every 10 min)   |
+--+-----+------+--+
   |     |      |
   v     v      v          (parallel)
+--+--+ +--+--+ +--+--+
| PR  | | Iss | | Iss |
| Rev | | Rep | | Lab |
| Agt | | Agt | | Agt |
+--+--+ +--+--+ +--+--+
   |     |      |
   +--+--+--+---+
      |     |
      v     v
+-----+-+ +-+-------+
|GitHub | | Audit   |
|Service| | Service |
+---+---+ +----+----+
    |          |
    v          v
  gh CLI    TiDB Cloud
             Zero
```

## Communication Patterns

- **Scheduler → Agents**: 直接方法调用（Promise.allSettled 并行）
- **Agents → GitHubService**: 直接方法调用（async/await）
- **Agents → AuditService**: 直接方法调用（async/await）
- **Agents → RuleEngine**: 直接方法调用（同步读取缓存的规则）
- **GitHubService → gh CLI**: child_process.exec（异步命令执行）
- **AuditService → TiDB**: MySQL 连接池（mysql2，TLS）

## Initialization Order

1. ConfigService.validate() — 验证环境变量
2. RuleEngine.loadRules() — 加载规则文件
3. AuditService.initialize() — 初始化数据库连接和表
4. GitHubService (ready after ConfigService)
5. Agents (ready after GitHubService + RuleEngine + AuditService)
6. Scheduler.start() — 启动定时调度

## Shutdown Order

1. Scheduler.stop() — 停止调度
2. (等待正在执行的任务完成)
3. AuditService.close() — 关闭数据库连接
