# Design Document

## Overview

本设计解决 FreeDraggable 组件在 Flex 容器内同行字段拖拽时的相互影响问题。核心改动是将位置偏移从 `margin` 改为 `transform`，使每个字段能够独立于布局流进行移动。

## Architecture

### 当前问题分析

当前 FreeDraggable 使用 `marginLeft` 和 `marginTop` 实现位置偏移：

```tsx
const offsetStyle: React.CSSProperties = hasOffset ? {
  marginLeft: currentPos.x,
  marginTop: currentPos.y,
} : {};
```

这种方式的问题：
1. `margin` 会影响文档流，导致同行其他元素被推开
2. 在 `flex` 容器中，`items-baseline` 对齐会使所有元素跟随移动
3. `justify-between` 会限制末端元素的水平移动空间

### 解决方案

使用 CSS `transform: translate()` 替代 `margin`：

```tsx
const offsetStyle: React.CSSProperties = hasOffset ? {
  transform: `translate(${currentPos.x}px, ${currentPos.y}px)`,
} : {};
```

`transform` 的优势：
1. 不影响文档流，元素在原位置占位
2. 不受 flex 对齐规则影响
3. 性能更好（GPU 加速）

## Components and Interfaces

### FreeDraggable 组件修改

```typescript
interface FreeDraggableProps {
  id: string;
  children: React.ReactNode;
  position?: { x: number; y: number };
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  disabled?: boolean;
  editMode?: boolean;
  className?: string;
  snapX?: number;
  snapY?: number;
  containerSelector?: string;
}
```

接口保持不变，仅修改内部实现。

### 核心修改点

1. **位置偏移样式**：从 margin 改为 transform
2. **碰撞检测**：更新计算逻辑以适应 transform
3. **拖拽手柄位置**：确保手柄跟随 transform 移动

## Data Models

无数据模型变更。`elementPositions` 状态结构保持不变：

```typescript
elementPositions: Record<string, { x: number; y: number }>
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Transform 独立性

*For any* FreeDraggable 元素在 Flex 容器中，当其 position 改变时，同容器内其他 FreeDraggable 元素的视觉位置应保持不变。

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: 位置偏移正确性

*For any* FreeDraggable 元素，其视觉位置应等于原始布局位置加上 position 偏移量。

**Validates: Requirements 2.1, 2.2**

### Property 3: 位置持久化往返

*For any* 有效的 position 对象，保存到 elementPositions 后再读取应得到相同的值。

**Validates: Requirements 3.1, 3.2**

### Property 4: 碰撞检测准确性

*For any* 两个 FreeDraggable 元素，当它们的文本区域重叠时，碰撞检测应返回 true。

**Validates: Requirements 4.2, 4.3**

## Error Handling

1. **无效位置值**：如果 position 包含 NaN 或 Infinity，使用默认值 { x: 0, y: 0 }
2. **碰撞回退**：拖拽结束时如有碰撞，回退到拖拽前位置
3. **容器不存在**：如果 containerSelector 指定的容器不存在，跳过碰撞检测

## Testing Strategy

### 单元测试

1. 测试 transform 样式正确生成
2. 测试碰撞检测函数
3. 测试位置持久化

### 属性测试

使用 fast-check 进行属性测试：
- 配置每个属性测试运行至少 100 次迭代
- 每个测试标注对应的设计属性

### 测试框架

- 单元测试：Vitest
- 属性测试：fast-check
