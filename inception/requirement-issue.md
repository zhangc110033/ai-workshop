Using AI-DLC, 
# TDD
### Sentry验收
- Sentry可以实现issues自动分配
- 等级包含critical和major的issues判断是否有PR，提了pr则测试通过
- 等级包含minor的issues判断是否有PR，提了pr则测试通过 的 issues 




# tools
MySQL数据库使用TiDB Cloud Zero即可，安装的提示词是：Read https://zero.tidbcloud.com/SKILL.md and follow the instructions to create a database using TiDB Cloud Zero.

# requirements spec
## 项目目标
围绕 GitHub、Sentry等系统，建设一个多 Agent 协作的平台，自动完成 issue 分配，给 issue 标记风险等级、issue 解决的周期统计，并形成可追踪的周报和后续行动闭环。
## 核心价值
- 降低人肉判断和汇总成本
- 提高 issue 分配和风险提醒准确率
- 把工程数据和用户体验数据打通
- 把周报从“人写总结”变成“系统给结论”
- 为团队和管理层提供持续的工程智能

## 功能设计
### Sentry
每1分钟获取Sentry最新的 issue，识别issue的风险，识别CodeOwner,分析错误根因，输出格式化的json

一 issue 的分配规则,按照如下优先级进行分配
1. codeowners
2. service owner
3. 解决类似 issue 的 PR 的贡献者
4. 提 issue 的作者进行兜底

二 怎么给 issue 做风险等级判断
1. issue 描述内容含有 "JS error ，"" 等级判定为 "critical"
2. issue 描述内容含有 "api，network" 等级判定为 "major"
3. issue 没有明确错误类型，assignee, 等级判定为 "minor"

三 issue 解决周期的统计
1. 纳入统计的 issue 范围： critical | major 的 issues 必须要有 PR 且 merge 才能关闭， minor 的 issues 必须要有 comment 才能关闭。
2. 统计不同风险等级的 issue 的从创建到关闭的时间周期。
3. 如果对 critical 类型的 issue 创建时间超过 7 天，还没关闭做出风险预警。
4. 统计近一个月内每个贡献者解决 issues 的数量。
目标project:dbaas-ui
目标环境:staging


