# Design Document: 智能分页集成

## Overview

本设计解决 PDF 渲染器未正确使用智能分页算法的问题。核心改动是修改 `renderPDF` 函数，使其基于 `calculateBreakPoints` 返回的分页点进行分页，而非简单地按固定高度切割 canvas。

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PDF 导出流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 用户点击下载 PDF                                         │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ analyzeContent  │  分析 DOM 结构，识别内容块              │
│  │    Blocks()     │  (section, item, skill-group)          │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ calculateBreak  │  计算最优分页点                         │
│  │    Points()     │  (避免孤儿标题、文字截断)               │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │   renderPDF()   │  基于分页点渲染 PDF                     │
│  │   [需要修改]     │  每页从 breakPoint[i] 到 breakPoint[i+1]│
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │   下载 PDF 文件  │                                        │
│  └─────────────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. 修改 `renderPDF` 函数

当前实现的问题：
```typescript
// 当前：按固定高度分页
const pageCount = Math.ceil(totalHeightMm / contentHeight);
const contentHeightPx = contentHeight / scale;

for (let i = 0; i < pageCount; i++) {
  const startY = i * contentHeightPx * opts.scale;  // 固定高度切割
  // ...
}
```

修改后的实现：
```typescript
// 修改后：基于智能分页点分页
const blocks = analyzeContentBlocks(resumeElement);
const { breakPoints } = calculateBreakPoints(blocks, {
  pageHeightMm: opts.pageHeight,
  pageWidthMm: opts.pageWidth,
  marginMm: opts.margin,
  minSectionHeaderSpace: 40,
  minItemSpace: 20,
});

for (let i = 0; i < breakPoints.length; i++) {
  const startY = breakPoints[i] * opts.scale;
  const endY = i < breakPoints.length - 1 
    ? breakPoints[i + 1] * opts.scale 
    : canvas.height;
  // 渲染从 startY 到 endY 的内容
}
```

### 2. 接口定义

```typescript
interface PageSlice {
  /** 起始 Y 坐标 (px) */
  startY: number;
  /** 结束 Y 坐标 (px) */
  endY: number;
  /** 切片高度 (px) */
  height: number;
}

/**
 * 根据分页点计算每页的切片信息
 */
function calculatePageSlices(
  breakPoints: number[],
  totalHeight: number,
  scale: number
): PageSlice[];
```

### 3. 渲染流程

1. **分析内容块**: 调用 `analyzeContentBlocks` 获取所有内容块信息
2. **计算分页点**: 调用 `calculateBreakPoints` 获取智能分页点
3. **计算页面切片**: 根据分页点计算每页的起始和结束位置
4. **渲染每页**: 
   - 创建页面 canvas
   - 从原始 canvas 复制对应区域
   - 添加到 PDF

## Data Models

### PageSlice

```typescript
interface PageSlice {
  startY: number;   // 起始 Y 坐标 (px)
  endY: number;     // 结束 Y 坐标 (px)
  height: number;   // 切片高度 (px)
}
```

### 现有类型（无需修改）

- `ContentBlock`: 内容块信息
- `PageBreakResult`: 分页计算结果
- `PageBreakConfig`: 分页配置
- `PDFRendererOptions`: PDF 渲染选项

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 分页点一致性

*For any* 简历内容，PDF 渲染器生成的页数应该与 `calculateBreakPoints` 返回的分页点数量一致，且每页的内容范围应该与分页点定义的范围匹配。

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: 孤儿标题避免

*For any* Section 标题，如果该标题距离页面底部不足 40mm，则该标题应该出现在下一页的顶部，而非当前页的底部。标题与其后的第一个条目应该始终在同一页。

**Validates: Requirements 2.1, 2.2**

### Property 3: 内容块完整性

*For any* 高度小于页面可用高度的内容块，该内容块不应该被分页截断。分页点应该只出现在内容块的边界处。

**Validates: Requirements 3.1, 3.2**

### Property 4: 超长内容分页合理性

*For any* 高度超过页面可用高度的内容块，分页应该发生在该内容块的子元素（如 highlight 列表项）之间，而非在文字中间截断。

**Validates: Requirements 3.3**

### Property 5: 页面布局一致性

*For any* 多页 PDF，每页的上边距应该保持一致。当页面底部空间不足以放置完整内容块时，应该保留空白而非填充部分内容。

**Validates: Requirements 4.1, 4.2**

## Error Handling

1. **空内容处理**: 如果简历内容为空，返回单页空白 PDF
2. **DOM 分析失败**: 如果无法分析内容块，回退到固定高度分页（当前行为）
3. **渲染错误**: 捕获 html2canvas 错误，提供友好的错误提示

## Testing Strategy

### 单元测试

1. **calculatePageSlices 函数测试**
   - 测试正常分页点转换为页面切片
   - 测试边界情况（单页、空分页点）

2. **renderPDF 集成测试**
   - 测试 PDF 页数是否正确
   - 测试每页内容范围是否正确

### 属性测试

使用 `fast-check` 库进行属性测试：

1. **Property 1 测试**: 生成随机内容块配置，验证 PDF 页数与分页点一致
2. **Property 2 测试**: 生成随机标题位置，验证孤儿标题被正确处理
3. **Property 3 测试**: 生成随机内容块，验证分页只发生在边界
4. **Property 4 测试**: 生成超长内容块，验证分页发生在子元素之间
5. **Property 5 测试**: 验证每页边距一致

每个属性测试运行至少 100 次迭代。

### 测试标注格式

```typescript
// Feature: smart-page-break-integration, Property 1: 分页点一致性
// Validates: Requirements 1.1, 1.2, 1.3
```
