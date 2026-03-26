# Unit of Work Dependencies — AI Workshop

## Dependency Matrix

| Unit | Depends On | Depended By |
|------|-----------|-------------|
| Unit 1: Core Infrastructure | — | All units |
| Unit 2: GitHub Integration | Unit 1 (ConfigService) | Unit 4 (Agents) |
| Unit 3: Rule Engine | — (filesystem) | Unit 4 (Agents) |
| Unit 4: Agents | Unit 2, Unit 3, Unit 5 | Unit 1 (Scheduler) |
| Unit 5: Audit & Persistence | Unit 1 (ConfigService) | Unit 4 (Agents) |

## Build Order (推荐实现顺序)

```
1. Unit 1: Core Infrastructure  (无依赖，基础设施)
   |
   +---> 2. Unit 2: GitHub Integration  (依赖 ConfigService)
   |
   +---> 3. Unit 3: Rule Engine  (无外部依赖)
   |
   +---> 4. Unit 5: Audit & Persistence  (依赖 ConfigService)
   |
   +---> 5. Unit 4: Agents  (依赖 Unit 2, 3, 5)
```

## Integration Points

| From | To | Interface | Pattern |
|------|----|-----------|---------|
| Scheduler → Agents | Unit 1 → Unit 4 | `agent.execute()` | Promise.allSettled |
| Agents → GitHub | Unit 4 → Unit 2 | `github.listOpenPRs()` etc. | async/await |
| Agents → Rules | Unit 4 → Unit 3 | `rules.getPRReviewRules()` etc. | sync (cached) |
| Agents → Audit | Unit 4 → Unit 5 | `audit.log(entry)` | async/await |

## Notes
- Unit 2 和 Unit 3 可以并行开发（无相互依赖）
- Unit 4 (Agents) 是最后实现的，因为它依赖所有其他 Unit
- Unit 5 可以与 Unit 2/3 并行开发
