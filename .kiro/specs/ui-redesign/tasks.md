# Implementation Plan: UI Redesign

## Overview

本实现计划将 ResumeForge 简历生成器的 UI 重新设计分解为可执行的编码任务。采用渐进式实现策略，从基础设计系统开始，逐步更新各个组件。

## Tasks

- [x] 1. 设置设计系统基础
  - [x] 1.1 更新 CSS 变量和 Tailwind 配置
    - 更新 `src/index.css` 添加新的 CSS 变量（颜色、间距、圆角、阴影、过渡）
    - 更新 `tailwind.config.js` 扩展主题配置
    - 添加 Google Fonts 导入（Poppins + Open Sans）
    - _Requirements: 4.1, 4.4_

  - [x] 1.2 编写设计系统属性测试
    - **Property 4: Color Contrast Compliance**
    - **Validates: Requirements 4.2, 4.3**

- [x] 2. 重新设计 Header 组件
  - [x] 2.1 实现浮动式毛玻璃导航栏
    - 更新 `src/features/header/Header.tsx`
    - 应用浮动定位（top-4 left-4 right-4）
    - 添加毛玻璃效果（bg-white/80 backdrop-blur-xl）
    - 重新组织按钮分组和间距
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.2 统一图标尺寸和交互样式
    - 确保所有图标使用 w-4 h-4
    - 添加 cursor-pointer 到所有可点击元素
    - 添加 transition-colors duration-200
    - _Requirements: 1.5, 5.1, 5.2_

  - [x] 2.3 编写 Header 属性测试
    - **Property 1: Icon Sizing Consistency**
    - **Validates: Requirements 1.5**

  - [x] 2.4 实现移动端响应式布局
    - 在 < 768px 时折叠次要操作到下拉菜单
    - 优化移动端按钮布局
    - _Requirements: 1.6, 6.1_

- [x] 3. Checkpoint - 确保 Header 测试通过
  - 确保所有测试通过，如有问题请询问用户

- [x] 4. 重新设计 Editor 面板
  - [x] 4.1 更新 SectionWrapper 样式
    - 更新 `src/features/editor/SectionWrapper.tsx`
    - 应用圆角卡片样式（rounded-xl）
    - 添加 hover 阴影效果
    - 优化拖拽手柄样式
    - _Requirements: 2.2, 2.3, 2.5_

  - [x] 4.2 统一 Editor 间距和布局
    - 更新 `src/features/editor/Editor.tsx`
    - 应用 gap-4 到模块间距
    - 应用 gap-2 到表单字段间距
    - 更新背景和边框样式
    - _Requirements: 2.1, 2.4_

  - [x] 4.3 编写 Editor 属性测试
    - **Property 2: Section Spacing Consistency**
    - **Validates: Requirements 2.4**

- [x] 5. 重新设计 Preview 区域
  - [x] 5.1 更新 Preview 容器样式
    - 更新 `src/features/preview/Preview.tsx`
    - 应用渐变背景（from-slate-50 via-slate-100 to-slate-50）
    - 更新纸张阴影效果
    - _Requirements: 3.1, 3.2_

  - [x] 5.2 优化编辑模式指示器和工具栏
    - 更新编辑模式边框指示器样式
    - 应用毛玻璃效果到工具栏
    - 优化缩放动画（ease-out）
    - _Requirements: 3.3, 3.4, 3.5_

  - [x] 5.3 编写 Preview 属性测试
    - **Property 3: Edit Mode Visual Indicator**
    - **Validates: Requirements 3.3**

- [x] 6. Checkpoint - 确保主要组件测试通过
  - 确保所有测试通过，如有问题请询问用户

- [x] 7. 更新基础 UI 组件
  - [x] 7.1 更新 Button 组件变体
    - 更新 `src/components/ui/button.tsx`
    - 实现 primary/secondary/ghost/danger 变体
    - 添加焦点环样式
    - 统一过渡动效
    - _Requirements: 7.1, 7.2, 5.3_

  - [x] 7.2 更新 Input 组件样式
    - 更新 `src/components/ui/input.tsx`
    - 应用统一高度（h-10）和圆角
    - 添加焦点环样式（ring-2 ring-blue-500）
    - _Requirements: 7.3, 7.4_

  - [x] 7.3 编写 Input 属性测试
    - **Property 9: Input Styling Consistency**
    - **Validates: Requirements 7.3, 7.4**

  - [x] 7.4 更新 Select/Dropdown 样式
    - 确保 Select 样式与 Input 一致
    - 添加统一的箭头指示器
    - _Requirements: 7.5_

  - [x] 7.5 编写 Select 属性测试
    - **Property 10: Select Styling Consistency**
    - **Validates: Requirements 7.5**

- [x] 8. 更新 Layout 响应式布局
  - [x] 8.1 优化 Layout 组件响应式断点
    - 更新 `src/features/layout/Layout.tsx`
    - 平板端（768px-1024px）：Editor 40% / Preview 60%
    - 桌面端（> 1024px）：Editor 33% / Preview 67%
    - _Requirements: 6.4, 6.5_

  - [x] 8.2 优化移动端标签导航
    - 更新移动端 Editor/Preview 切换标签样式
    - 确保无水平滚动
    - _Requirements: 6.2, 6.3_

  - [x] 8.3 编写 Layout 属性测试
    - **Property 8: No Horizontal Scroll**
    - **Validates: Requirements 6.3**

- [x] 9. 交互和可访问性优化
  - [x] 9.1 添加 prefers-reduced-motion 支持
    - 在 CSS 中添加 @media (prefers-reduced-motion: reduce) 规则
    - 禁用或简化动画
    - _Requirements: 5.4_

  - [x] 9.2 统一所有可点击元素的交互样式
    - 确保所有按钮、链接、卡片有 cursor-pointer
    - 确保所有交互元素有 transition-colors duration-200
    - _Requirements: 5.1, 5.2_

  - [x] 9.3 编写交互属性测试
    - **Property 5: Interactive Element Cursor**
    - **Property 6: Transition Timing Consistency**
    - **Property 7: Focus Ring Visibility**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 10. Final Checkpoint - 确保所有测试通过
  - 运行完整测试套件
  - 确保所有属性测试通过
  - 如有问题请询问用户

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
