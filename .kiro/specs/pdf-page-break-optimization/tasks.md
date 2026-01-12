# Implementation Plan: PDF分页优化

## Overview

本实现计划将智能分页功能分解为可执行的编码任务，从核心算法到UI集成逐步实现。

## Tasks

- [x] 1. 创建PageBreakCalculator核心模块
  - [x] 1.1 创建类型定义文件 `src/lib/pdf/types.ts`
    - 定义 ContentBlock、PageBreakResult、PageBreakConfig 等接口
    - _Requirements: 2.1, 2.2, 3.1_

  - [x] 1.2 实现 `analyzeContentBlocks` 函数
    - 创建 `src/lib/pdf/pageBreakCalculator.ts`
    - 遍历简历DOM，识别section标题、条目、技能组等内容块
    - 计算每个内容块的位置和高度
    - _Requirements: 1.1, 2.1, 3.1_

  - [x] 1.3 实现 `calculateBreakPoints` 函数
    - 根据内容块位置计算最优分页点
    - 确保section标题不孤立（至少40mm后续空间）
    - 确保条目和技能组不被截断
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2_

  - [x] 1.4 编写PageBreakCalculator单元测试
    - 测试内容块识别逻辑
    - 测试分页点计算逻辑
    - _Requirements: 1.1, 2.1, 3.1_

- [x] 2. 为模板添加分页标记CSS类
  - [x] 2.1 更新 `src/index.css` 打印样式
    - 添加 `.resume-section`、`.resume-item`、`.skill-group` 的分页控制规则
    - 增强 `page-break-inside: avoid` 和 `break-inside: avoid` 规则
    - _Requirements: 5.2_

  - [x] 2.2 更新 ClassicTemplate 添加分页标记类
    - 为section容器添加 `resume-section` 类
    - 为条目添加 `resume-item` 类
    - 为技能组添加 `skill-group` 类
    - _Requirements: 2.1, 3.1_

  - [x] 2.3 更新其他模板添加分页标记类
    - ModernTemplate、MinimalTemplate、ProfessionalTemplate
    - ElegantTemplate、CreativeTemplate、ExecutiveTemplate、TechTemplate
    - _Requirements: 2.1, 3.1_

- [x] 3. 重构PDF下载功能
  - [x] 3.1 创建 `src/lib/pdf/pdfRenderer.ts`
    - 实现基于分页点的PDF渲染逻辑
    - 使用html2canvas分页渲染每一页
    - 使用jsPDF合并页面
    - _Requirements: 4.1, 4.2_

  - [x] 3.2 更新 `Header.tsx` 的 `handleDownloadPDF` 函数
    - 集成PageBreakCalculator
    - 调用新的PDFRenderer
    - _Requirements: 1.1, 2.1, 4.1_

  - [x] 3.3 编写PDF渲染属性测试
    - **Property 1: Section标题不孤立**
    - **Property 2: 条目完整性**
    - **Validates: Requirements 1.1, 1.2, 2.1, 2.2**

- [x] 4. Checkpoint - 确保PDF下载分页正常
  - 确保所有测试通过，如有问题请询问用户

- [x] 5. 优化打印功能
  - [x] 5.1 更新 `handlePrint` 函数
    - 应用与PDF下载相同的分页CSS
    - 确保打印预览与PDF一致
    - _Requirements: 5.1_

  - [x] 5.2 编写打印与PDF一致性测试
    - **Property 6: 打印与PDF一致性**
    - **Validates: Requirements 5.1**

- [x] 6. 处理超长内容边界情况
  - [x] 6.1 实现超长条目分页逻辑
    - 当条目高度超过页面高度时，在highlight列表项之间分页
    - 添加警告提示
    - _Requirements: 2.3_

  - [x] 6.2 编写超长内容属性测试
    - **Property 3: 超长条目分页点合理性**
    - **Validates: Requirements 2.3**

- [x] 7. Final Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

## Notes

- 所有任务都是必须完成的，包括测试
- 核心功能在任务1-3中实现，任务5-6为增强功能
- 属性测试使用 `fast-check` 库，需要先安装依赖
- 每个模板都需要添加分页标记类，确保一致性
