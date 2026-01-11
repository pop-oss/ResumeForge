# Implementation Plan: Template Field Editing

## Overview

本实现计划将模板字段编辑与拖拽排版功能分解为可执行的编码任务。采用渐进式实现策略，先扩展数据模型，再实现核心组件，最后集成到现有模板中。

## Tasks

- [x] 1. 扩展数据模型和类型定义
  - [x] 1.1 扩展 ResumeSettings 类型，添加 fieldOrder 和 fieldVisibility 配置
    - 修改 `src/features/resume/types.ts`
    - 添加 FieldOrderConfig 和 FieldVisibilityConfig 接口
    - 扩展 ResumeSettings 接口
    - _Requirements: 2.5, 3.3, 7.4_

  - [x] 1.2 更新初始数据和默认配置
    - 修改 `src/features/resume/data.ts`
    - 添加 DEFAULT_FIELD_ORDER 和 DEFAULT_FIELD_VISIBILITY 常量
    - 更新 initialResumeData 包含新配置
    - _Requirements: 3.1, 4.1, 5.1_

  - [x] 1.3 扩展 ResumeContext 添加字段排序和可见性更新方法
    - 修改 `src/features/resume/ResumeContext.tsx`
    - 添加 updateFieldOrder 方法
    - 添加 updateFieldVisibility 方法
    - 添加 toggleEditMode 方法
    - _Requirements: 2.3, 6.2, 7.2_

  - [x] 1.4 编写配置持久化属性测试
    - **Property 5: Configuration Persistence Round-Trip**
    - **Validates: Requirements 2.5, 3.3, 6.5, 7.4**

- [x] 2. 实现 InlineEditor 组件
  - [x] 2.1 创建 InlineEditor 基础组件
    - 创建 `src/components/ui/inline-editor.tsx`
    - 实现单行文本编辑功能
    - 实现多行文本编辑功能
    - 支持 Enter 确认和 Escape 取消
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6_

  - [x] 2.2 编写编辑取消恢复属性测试
    - **Property 2: Edit Cancel Round-Trip**
    - **Validates: Requirements 1.4**

  - [x] 2.3 编写数据同步一致性属性测试
    - **Property 1: Data Sync Consistency**
    - **Validates: Requirements 1.2, 1.3, 8.1, 8.2**

- [x] 3. 实现 DraggableField 组件
  - [x] 3.1 创建 DraggableField 包装组件
    - 创建 `src/components/ui/draggable-field.tsx`
    - 使用 @dnd-kit/sortable 实现拖拽功能
    - 添加拖拽手柄样式
    - 支持禁用状态
    - _Requirements: 2.1, 2.2, 2.6_

  - [x] 3.2 编写拖拽排序正确性属性测试
    - **Property 3: Drag Reorder Correctness**
    - **Validates: Requirements 2.3, 3.2, 4.2, 5.2**

- [x] 4. 实现 FieldVisibilityToggle 组件
  - [x] 4.1 创建字段可见性切换组件
    - 创建 `src/components/ui/field-visibility-toggle.tsx`
    - 实现切换按钮UI
    - 连接到 ResumeContext
    - _Requirements: 7.1, 7.2_

  - [x] 4.2 编写字段可见性切换属性测试
    - **Property 8: Field Visibility Toggle**
    - **Validates: Requirements 7.2, 7.3**

- [x] 5. Checkpoint - 核心组件完成
  - 确保所有测试通过，如有问题请询问用户

- [x] 6. 实现编辑模式管理
  - [x] 6.1 创建 useEditMode Hook
    - 创建 `src/hooks/useEditMode.ts`
    - 实现编辑模式状态管理
    - 支持状态持久化
    - _Requirements: 6.2, 6.5_

  - [x] 6.2 在 Preview 组件添加编辑模式切换按钮
    - 修改 `src/features/preview/Preview.tsx`
    - 添加编辑模式切换UI
    - _Requirements: 6.1, 6.3, 6.4_

  - [x] 6.3 编写编辑模式切换属性测试
    - **Property 9: Edit Mode Toggle**
    - **Validates: Requirements 6.2**

  - [x] 6.4 编写编辑模式UI状态属性测试
    - **Property 7: Edit Mode UI State**
    - **Validates: Requirements 2.1, 6.3, 6.4, 7.1**

- [x] 7. 创建可编辑模板包装器
  - [x] 7.1 创建 EditableSection 组件
    - 创建 `src/features/preview/components/EditableSection.tsx`
    - 封装字段拖拽排序逻辑
    - 封装字段可见性控制
    - _Requirements: 2.1, 2.3, 2.4_

  - [x] 7.2 创建可编辑字段渲染器
    - 创建 `src/features/preview/components/EditableField.tsx`
    - 组合 InlineEditor、DraggableField、FieldVisibilityToggle
    - _Requirements: 1.1, 2.1, 7.1_

  - [x] 7.3 编写字段顺序渲染一致性属性测试
    - **Property 4: Field Order Rendering Consistency**
    - **Validates: Requirements 2.4**

- [x] 8. 集成到 ElegantTemplate
  - [x] 8.1 重构 ElegantTemplate 支持字段编辑和排序
    - 修改 `src/features/preview/templates/ElegantTemplate.tsx`
    - 使用 EditableSection 和 EditableField 组件
    - 实现基本信息字段排序
    - 实现工作经验字段排序
    - 实现教育背景字段排序
    - _Requirements: 1.1, 2.4, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2_

  - [x] 8.2 编写字段顺序统一性属性测试
    - **Property 6: Field Order Uniformity**
    - **Validates: Requirements 4.3, 5.3**

- [x] 9. Checkpoint - ElegantTemplate 集成完成
  - 确保所有测试通过，如有问题请询问用户

- [x] 10. 集成到其他模板
  - [x] 10.1 重构 ModernTemplate 支持字段编辑和排序
    - 修改 `src/features/preview/templates/ModernTemplate.tsx`
    - _Requirements: 1.1, 2.4, 3.1, 4.1, 5.1_

  - [x] 10.2 重构 MinimalTemplate 支持字段编辑和排序
    - 修改 `src/features/preview/templates/MinimalTemplate.tsx`
    - _Requirements: 1.1, 2.4, 3.1, 4.1, 5.1_

  - [x] 10.3 重构 ClassicTemplate 支持字段编辑和排序
    - 修改 `src/features/preview/templates/ClassicTemplate.tsx`
    - _Requirements: 1.1, 2.4, 3.1, 4.1, 5.1_

  - [x] 10.4 重构 CreativeTemplate 支持字段编辑和排序
    - 修改 `src/features/preview/templates/CreativeTemplate.tsx`
    - _Requirements: 1.1, 2.4, 3.1, 4.1, 5.1_

  - [x] 10.5 重构 ProfessionalTemplate 支持字段编辑和排序
    - 修改 `src/features/preview/templates/ProfessionalTemplate.tsx`
    - _Requirements: 1.1, 2.4, 3.1, 4.1, 5.1_

  - [x] 10.6 重构 ExecutiveTemplate 支持字段编辑和排序
    - 修改 `src/features/preview/templates/ExecutiveTemplate.tsx`
    - _Requirements: 1.1, 2.4, 3.1, 4.1, 5.1_

  - [x] 10.7 重构 TechTemplate 支持字段编辑和排序
    - 修改 `src/features/preview/templates/TechTemplate.tsx`
    - _Requirements: 1.1, 2.4, 3.1, 4.1, 5.1_

- [x] 11. 数据同步验证
  - [x] 11.1 确保预览区编辑与左侧表单双向同步
    - 验证 ResumeContext 作为单一数据源
    - 测试编辑同步功能
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 12. Final Checkpoint - 功能完成
  - 确保所有测试通过，如有问题请询问用户

## Notes

- 所有任务均为必需，包括属性测试任务
- 每个任务都引用了具体的需求条款以确保可追溯性
- Checkpoint 任务用于增量验证
- 属性测试验证通用正确性属性
- 单元测试验证具体示例和边界情况
