# Implementation Plan: 智能分页集成

## Overview

本实现计划将智能分页算法集成到 PDF 渲染器中，确保分页发生在语义边界处，避免孤儿标题和文字截断。

## Tasks

- [x] 1. 实现 calculatePageSlices 辅助函数
  - [x] 1.1 在 `src/lib/pdf/pdfRenderer.ts` 中添加 `calculatePageSlices` 函数
    - 接收分页点数组、总高度和缩放比例
    - 返回每页的起始和结束位置
    - _Requirements: 1.2, 1.3_

  - [x] 1.2 编写 calculatePageSlices 单元测试
    - 测试正常分页点转换
    - 测试边界情况（单页、空分页点）
    - _Requirements: 1.2, 1.3_

- [x] 2. 修改 renderPDF 函数集成智能分页
  - [x] 2.1 修改 `renderPDF` 函数使用 `calculateBreakPoints`
    - 调用 `analyzeContentBlocks` 分析 DOM
    - 调用 `calculateBreakPoints` 获取分页点
    - 使用 `calculatePageSlices` 计算每页范围
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 修改分页渲染逻辑
    - 基于分页点切割 canvas，而非固定高度
    - 确保每页从分页点开始，到下一个分页点结束
    - _Requirements: 1.2, 1.3, 4.1_

  - [x] 2.3 编写属性测试：分页点一致性
    - **Property 1: 分页点一致性**
    - **Validates: Requirements 1.1, 1.2, 1.3**

- [x] 3. Checkpoint - 确保基本分页功能正常
  - 确保所有测试通过，如有问题请询问用户

- [x] 4. 验证孤儿标题和内容块完整性
  - [x] 4.1 编写属性测试：孤儿标题避免
    - **Property 2: 孤儿标题避免**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 4.2 编写属性测试：内容块完整性
    - **Property 3: 内容块完整性**
    - **Validates: Requirements 3.1, 3.2**

- [x] 5. 处理超长内容边界情况
  - [x] 5.1 编写属性测试：超长内容分页合理性
    - **Property 4: 超长内容分页合理性**
    - **Validates: Requirements 3.3**

- [x] 6. 验证页面布局一致性
  - [x] 6.1 编写属性测试：页面布局一致性
    - **Property 5: 页面布局一致性**
    - **Validates: Requirements 4.1, 4.2**

- [x] 7. Final Checkpoint - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

## Notes

- 所有任务都是必须完成的，包括测试
- 核心功能在任务 1-2 中实现
- 属性测试使用 `fast-check` 库
- 现有的 `calculateBreakPoints` 函数已经实现了孤儿标题和内容块完整性的逻辑，本次改动主要是确保 PDF 渲染器正确使用这些分页点
