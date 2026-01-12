# Requirements Document

## Introduction

本功能解决简历预览模板中同一行内多个可拖拽字段的独立拖拽问题。当前实现中，教育部分的学校、专业和日期三个字段在同一行，但拖拽行为存在问题：日期不能左右拖拽，且上下拖拽任一字段会影响其他字段一起移动。本功能将实现同行字段的完全独立拖拽能力。

## Glossary

- **FreeDraggable**: 自由拖拽组件，允许元素在预览区域内自由移动
- **Inline_Fields**: 同一行内的多个可拖拽字段，如教育部分的学校、专业、日期
- **Position_Offset**: 元素相对于原始位置的偏移量，包含 x 和 y 坐标
- **Flex_Container**: 使用 CSS Flexbox 布局的容器元素
- **Independent_Drag**: 独立拖拽，指一个字段的拖拽不影响同行其他字段的位置

## Requirements

### Requirement 1: 同行字段独立拖拽

**User Story:** 作为用户，我希望能够独立拖拽同一行内的每个字段，以便精确调整每个字段的位置而不影响其他字段。

#### Acceptance Criteria

1. WHEN 用户拖拽同一行内的某个字段上下移动 THEN THE FreeDraggable SHALL 仅移动该字段而不影响同行其他字段的垂直位置
2. WHEN 用户拖拽同一行内的某个字段左右移动 THEN THE FreeDraggable SHALL 仅移动该字段而不影响同行其他字段的水平位置
3. WHEN 多个字段在同一 Flex_Container 中 THEN THE FreeDraggable SHALL 使用 CSS transform 而非 margin 来实现位置偏移

### Requirement 2: 日期字段水平拖拽

**User Story:** 作为用户，我希望能够左右拖拽日期字段，以便调整日期在行内的水平位置。

#### Acceptance Criteria

1. WHEN 用户拖拽日期字段 THEN THE FreeDraggable SHALL 允许水平方向的移动
2. WHEN 日期字段位于 Flex_Container 的末端 THEN THE FreeDraggable SHALL 不受 justify-between 布局的限制而能够自由移动

### Requirement 3: 位置偏移持久化

**User Story:** 作为用户，我希望字段的位置调整能够被保存，以便下次打开时保持调整后的位置。

#### Acceptance Criteria

1. WHEN 用户完成字段拖拽 THEN THE System SHALL 保存该字段的 Position_Offset 到 elementPositions 状态
2. WHEN 页面重新加载 THEN THE FreeDraggable SHALL 从 elementPositions 恢复字段的位置偏移

### Requirement 4: 视觉反馈

**User Story:** 作为用户，我希望在拖拽时能够看到清晰的视觉反馈，以便了解当前的拖拽状态。

#### Acceptance Criteria

1. WHEN 用户正在拖拽字段 THEN THE FreeDraggable SHALL 显示拖拽中的视觉状态（如半透明效果）
2. WHEN 拖拽的字段与其他字段文本区域重叠 THEN THE FreeDraggable SHALL 显示碰撞警告（如红色边框）
3. IF 拖拽结束时存在碰撞 THEN THE FreeDraggable SHALL 将字段回退到拖拽前的位置
