# Requirements Document

## Introduction

本功能旨在修复简历 PDF 导出时的分页问题。当前的 PDF 渲染器虽然有智能分页算法（`calculateBreakPoints`），但实际渲染时并未使用该算法，导致：
1. **孤儿标题** - Section 标题（如"项目经历"）出现在页面底部，而内容在下一页
2. **文字截断** - 文字从中间被分页截断，而非在合适的位置分页

本需求将确保 PDF 渲染器正确集成智能分页算法，在语义边界处进行分页。

## Glossary

- **PDF_Renderer**: 负责将简历 HTML 内容转换为 PDF 文件的模块
- **Page_Break_Calculator**: 分析 DOM 结构并计算最优分页点的算法模块
- **Content_Block**: 不应被分页截断的最小内容单元（如 section 标题、工作经历条目）
- **Orphan_Header**: 孤儿标题，指 section 标题单独出现在页面底部，而其内容在下一页
- **Break_Point**: 分页点，表示应该在此位置进行分页的 Y 坐标位置

## Requirements

### Requirement 1: 集成智能分页算法

**User Story:** As a 用户, I want PDF 渲染器使用智能分页算法, so that 分页发生在合适的位置而非固定高度处。

#### Acceptance Criteria

1. WHEN PDF_Renderer 渲染简历 THEN THE PDF_Renderer SHALL 调用 Page_Break_Calculator 计算分页点
2. WHEN 分页点被计算出来 THEN THE PDF_Renderer SHALL 在这些分页点位置进行分页，而非按固定高度分页
3. WHEN 渲染每一页 THEN THE PDF_Renderer SHALL 从上一个分页点开始，到下一个分页点结束

### Requirement 2: 避免孤儿标题

**User Story:** As a 用户, I want Section 标题不会单独出现在页面底部, so that 打印出来的简历看起来专业整洁。

#### Acceptance Criteria

1. WHEN Section 标题距离页面底部不足 40mm THEN THE PDF_Renderer SHALL 将该 Section 整体移至下一页
2. WHEN Section 标题后的第一个条目无法在当前页完整显示 THEN THE PDF_Renderer SHALL 将标题和第一个条目一起移至下一页

### Requirement 3: 避免文字截断

**User Story:** As a 用户, I want 文字内容不会从中间被截断, so that 阅读者可以完整地看到每个条目的信息。

#### Acceptance Criteria

1. WHEN 一个 Content_Block 无法在当前页完整显示 THEN THE PDF_Renderer SHALL 将该内容块整体移至下一页
2. WHEN 分页发生 THEN THE PDF_Renderer SHALL 在 Content_Block 之间进行分页，而非在内容块内部截断
3. IF 一个 Content_Block 高度超过整页高度 THEN THE PDF_Renderer SHALL 在该内容块的子元素（如 highlight 列表项）之间进行分页

### Requirement 4: 保持页面边距一致性

**User Story:** As a 用户, I want 每页的边距保持一致, so that 打印出来的多页简历看起来统一专业。

#### Acceptance Criteria

1. WHEN 内容被移至新页 THEN THE PDF_Renderer SHALL 在新页顶部保持与第一页相同的上边距
2. WHEN 页面底部有剩余空间但不足以放置下一个完整内容块 THEN THE PDF_Renderer SHALL 保留该空白而非强行填充部分内容
