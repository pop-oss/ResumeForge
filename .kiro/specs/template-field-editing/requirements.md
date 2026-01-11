# Requirements Document

## Introduction

本功能为简历生成器添加模板内容的可编辑能力和子字段拖拽排版功能。用户可以直接在预览区域编辑内容，并通过拖拽调整各个字段在PDF中的显示顺序和布局，实现更灵活的简历定制。

## Glossary

- **Template**: 简历预览模板，如 ElegantTemplate、ModernTemplate 等，定义简历的视觉呈现方式
- **Section**: 简历的主要模块，如基本信息(basics)、工作经验(experience)、教育背景(education)等
- **Field**: Section 内的具体字段，如姓名、职位、邮箱、电话等
- **Field_Order**: 字段在 Section 内的显示顺序配置
- **Inline_Editor**: 在预览区域直接编辑内容的组件
- **Drag_Handle**: 用于拖拽排序的可视化手柄
- **Preview_Area**: 简历预览区域，显示最终PDF效果
- **Edit_Mode**: 预览区域的编辑模式，启用后可直接修改内容

## Requirements

### Requirement 1: 预览区域内容可编辑

**User Story:** 作为用户，我希望能够直接在预览区域编辑简历内容，这样我可以所见即所得地修改简历。

#### Acceptance Criteria

1. WHEN 用户点击预览区域的可编辑字段 THEN Inline_Editor SHALL 激活该字段的编辑状态并显示输入框
2. WHEN 用户在 Inline_Editor 中修改内容 THEN Template SHALL 实时更新显示内容
3. WHEN 用户完成编辑（失去焦点或按Enter键）THEN ResumeContext SHALL 保存修改后的数据
4. WHEN 用户按 Escape 键 THEN Inline_Editor SHALL 取消编辑并恢复原始内容
5. THE Inline_Editor SHALL 支持单行文本字段（如姓名、职位、邮箱）的编辑
6. THE Inline_Editor SHALL 支持多行文本字段（如工作描述、项目亮点）的编辑

### Requirement 2: Section 内字段拖拽排序

**User Story:** 作为用户，我希望能够通过拖拽调整 Section 内各字段的显示顺序，这样我可以自定义简历的布局。

#### Acceptance Criteria

1. WHEN Edit_Mode 启用时 THEN Template SHALL 在每个可排序字段旁显示 Drag_Handle
2. WHEN 用户拖拽 Drag_Handle THEN Template SHALL 显示拖拽预览效果
3. WHEN 用户释放拖拽的字段 THEN Field_Order SHALL 更新为新的排列顺序
4. WHEN Field_Order 更新后 THEN Template SHALL 按新顺序渲染字段
5. THE Field_Order SHALL 持久化存储到 localStorage
6. WHILE 用户拖拽字段时 THEN Template SHALL 显示放置位置的视觉指示器

### Requirement 3: 基本信息字段排序

**User Story:** 作为用户，我希望能够调整基本信息区域（姓名、职位、联系方式等）的字段顺序，这样我可以突出重要信息。

#### Acceptance Criteria

1. THE Template SHALL 支持以下基本信息字段的排序：姓名、职位、邮箱、电话、城市、网站、LinkedIn
2. WHEN 用户拖拽基本信息字段 THEN Template SHALL 更新该字段在基本信息区域的位置
3. WHEN 基本信息字段顺序改变 THEN ResumeSettings SHALL 保存新的 basics_field_order 配置

### Requirement 4: 工作经验条目内字段排序

**User Story:** 作为用户，我希望能够调整每个工作经验条目内的字段顺序（公司名、职位、时间、描述等），这样我可以按需突出不同信息。

#### Acceptance Criteria

1. THE Template SHALL 支持工作经验条目内以下字段的排序：公司名、职位、城市、时间范围、工作描述
2. WHEN 用户拖拽工作经验字段 THEN Template SHALL 更新该字段在条目内的位置
3. THE Field_Order 配置 SHALL 应用于所有工作经验条目（统一布局）

### Requirement 5: 教育背景条目内字段排序

**User Story:** 作为用户，我希望能够调整教育背景条目内的字段顺序，这样我可以根据需要突出学校、学位或专业。

#### Acceptance Criteria

1. THE Template SHALL 支持教育背景条目内以下字段的排序：学校、学位、专业、时间范围、荣誉/成就
2. WHEN 用户拖拽教育背景字段 THEN Template SHALL 更新该字段在条目内的位置
3. THE Field_Order 配置 SHALL 应用于所有教育背景条目（统一布局）

### Requirement 6: 编辑模式切换

**User Story:** 作为用户，我希望能够切换预览区域的编辑模式，这样我可以在查看最终效果和编辑内容之间切换。

#### Acceptance Criteria

1. THE Preview_Area SHALL 提供编辑模式切换按钮
2. WHEN 用户点击编辑模式按钮 THEN Preview_Area SHALL 切换 Edit_Mode 状态
3. WHILE Edit_Mode 启用时 THEN Template SHALL 显示所有可编辑字段的编辑指示器
4. WHILE Edit_Mode 禁用时 THEN Template SHALL 隐藏所有编辑指示器和 Drag_Handle
5. THE Edit_Mode 状态 SHALL 在页面刷新后保持（持久化）

### Requirement 7: 字段可见性控制

**User Story:** 作为用户，我希望能够隐藏某些不需要的字段，这样我可以精简简历内容。

#### Acceptance Criteria

1. WHILE Edit_Mode 启用时 THEN Template SHALL 在每个可选字段旁显示可见性切换按钮
2. WHEN 用户点击可见性切换按钮 THEN Field SHALL 切换显示/隐藏状态
3. WHEN 字段被隐藏 THEN Template SHALL 不渲染该字段内容
4. THE 字段可见性配置 SHALL 持久化存储到 ResumeSettings

### Requirement 8: 数据同步

**User Story:** 作为用户，我希望在预览区域的编辑能够同步到左侧编辑器，这样数据保持一致。

#### Acceptance Criteria

1. WHEN 用户在 Preview_Area 编辑内容 THEN Editor 表单 SHALL 同步显示更新后的值
2. WHEN 用户在 Editor 表单编辑内容 THEN Preview_Area SHALL 实时反映更改
3. THE ResumeContext SHALL 作为单一数据源确保双向同步

