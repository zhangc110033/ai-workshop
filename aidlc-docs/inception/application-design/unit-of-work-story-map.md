# Unit of Work — Story Mapping

## Unit 1: Core Infrastructure
| Story | Title |
|-------|-------|
| US-12 | 定时任务调度 |
| US-13 | 任务失败容错 |
| US-14 | 系统启动与健康检查 |
| US-15 | 环境变量配置 |

## Unit 2: GitHub Integration
| Story | Title |
|-------|-------|
| (支撑层 — 无直接用户故事，被 Unit 4 的故事间接覆盖) |

## Unit 3: Rule Engine
| Story | Title |
|-------|-------|
| US-02 | PR Review Red Flag 检测（规则部分） |
| US-07 | 标签分类规则配置 |
| US-11 | 规则文件管理 |

## Unit 4: Agents (Business Logic)
| Story | Title |
|-------|-------|
| US-01 | PR 自动 Review 与 Approve |
| US-02 | PR Review Red Flag 检测（检测逻辑部分） |
| US-03 | Issue 自动回复 |
| US-04 | SPAM Issue 自动关闭 |
| US-05 | Issue 上下文理解 |
| US-06 | Issue 自动分类打标 |
| US-08 | 防止重复打标 |

## Unit 5: Audit & Persistence
| Story | Title |
|-------|-------|
| US-09 | 操作审计记录 |
| US-10 | 审计日志查询 |

## Coverage Summary

| Unit | Stories Count | Stories |
|------|--------------|---------|
| Unit 1: Core Infrastructure | 4 | US-12, US-13, US-14, US-15 |
| Unit 2: GitHub Integration | 0 | (支撑层) |
| Unit 3: Rule Engine | 3 | US-02(部分), US-07, US-11 |
| Unit 4: Agents | 7 | US-01, US-02(部分), US-03, US-04, US-05, US-06, US-08 |
| Unit 5: Audit & Persistence | 2 | US-09, US-10 |
| **Total** | **15** (all covered) | |
