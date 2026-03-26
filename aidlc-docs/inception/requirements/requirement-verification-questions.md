# Requirements Verification Questions

请回答以下问题，帮助我更好地理解需求。请在每个问题的 [Answer]: 标签后填写您的选择。

---

## Question 1
项目使用什么编程语言和运行时？

A) Node.js (TypeScript)
B) Python
C) Go
D) Java
X) Other (please describe after [Answer]: tag below)

[Answer]: A 

---

## Question 2
GitHub API 的认证方式？

A) GitHub App (推荐，适合组织级别的自动化)
B) Personal Access Token (PAT)
C) OAuth App
X) Other (please describe after [Answer]: tag below)

[Answer]: X — 使用本地 CLI git 命令，已登录 GitHub CLI (gh) 

---

## Question 3
定时任务（每10分钟巡检）的运行方式？

A) 本地 cron job / 系统定时任务
B) GitHub Actions scheduled workflow
C) 独立的后台服务（长驻进程 + 内置调度器如 node-cron）
D) 云函数 + 定时触发器（如 AWS Lambda + EventBridge）
X) Other (please describe after [Answer]: tag below)

[Answer]: C 

---

## Question 4
PR 自动 Review 中，"red flag" 的判定标准是什么？

A) 使用 AI/LLM 分析代码变更，判断是否有安全漏洞、逻辑错误等
B) 基于规则的静态检查（如文件大小、敏感文件变更、特定关键词）
C) 结合 AI 分析 + 规则检查
X) Other (please describe after [Answer]: tag below)

[Answer]: X — AI 自行定义标准规则，存放在 /rules/*.md 中，后续用户可修改 

---

## Question 5
Issue 自动回复中，"结合仓库的 context" 具体指什么？

A) 读取 README、文档、代码结构，用 AI 生成上下文相关的回复
B) 仅基于 Issue 标题和内容进行回复
C) 读取相关代码文件 + Issue 历史 + PR 历史，综合分析后回复
X) Other (please describe after [Answer]: tag below)

[Answer]: X — 对目标仓库的理解，目标仓库来自环境变量 ${REPOSITORY_URL} 

---

## Question 6
Issue SPAM 判定标准是什么？

A) 使用 AI/LLM 判断 Issue 内容是否为垃圾信息（广告、无意义内容、恶意链接等）
B) 基于关键词黑名单 + 用户信誉度
C) 结合 AI 判断 + 关键词规则
X) Other (please describe after [Answer]: tag below)

[Answer]: X — AI 自行定义，规则存放在 /rules/*.md 

---

## Question 7
Issue 自动打标的 label 分类体系是什么？

A) 预定义固定标签集（如 bug, feature, question, documentation, enhancement）
B) 由 AI 根据仓库已有标签动态匹配
C) 预定义标签集 + AI 可建议新标签
X) Other (please describe after [Answer]: tag below)

[Answer]: X — AI 自行定义，规则存放在 /rules/*.md 

---

## Question 8
这个系统需要监控多少个 GitHub 仓库？

A) 单个仓库
B) 同一个 GitHub Organization 下的多个仓库
C) 跨多个 Organization 的仓库
X) Other (please describe after [Answer]: tag below)

[Answer]: X — 根据环境变量 ${REPOSITORY_URL} 指定的单个仓库 

---

## Question 9
TiDB Cloud Zero 数据库除了审计日志外，是否还需要存储其他数据（如 Issue 统计、周报数据等）？

A) 仅存储审计日志（audit_logs 表）
B) 还需要存储 Issue 统计数据和周报数据
C) 后续可能扩展，但当前阶段仅审计日志
X) Other (please describe after [Answer]: tag below)

[Answer]: X — AI 自行定义 

---

## Question 10
关于验收测试（TDD），除了 GitHub Issue 的 SPAM 检测验收外，是否需要为 PR Review 和 Issue 打标功能也编写自动化验收测试？

A) 是，所有三个功能都需要自动化验收测试
B) 仅 Issue SPAM 检测需要验收测试（如需求中描述的）
C) 所有功能都需要，但可以分阶段实现
X) Other (please describe after [Answer]: tag below)

[Answer]: X — 验收标准已在需求中写清楚，按需求中描述的执行 

---

## Question 11: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: A 

---
