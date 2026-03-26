# Unit of Work Plan — AI Workshop

## Decomposition Strategy
单体 Node.js 服务，按功能模块划分逻辑单元。所有单元共享同一个进程和部署。

## Execution Checklist

### Phase 1: Unit Identification
- [x] 1.1 定义工作单元及其边界
- [x] 1.2 确定单元间依赖关系

### Phase 2: Story Mapping
- [x] 2.1 将用户故事映射到工作单元

### Phase 3: Artifact Generation
- [x] 3.1 生成 unit-of-work.md
- [x] 3.2 生成 unit-of-work-dependency.md
- [x] 3.3 生成 unit-of-work-story-map.md

---

## Clarification Questions

### Question 1
项目的代码组织方式偏好？

A) 按功能模块分目录（src/agents/, src/services/, src/rules/）— 经典分层
B) 按业务领域分目录（src/pr-review/, src/issue-reply/, src/issue-label/, src/shared/）— 领域驱动
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
