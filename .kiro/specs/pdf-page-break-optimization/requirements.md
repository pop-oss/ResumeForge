# Requirements Document

## Introduction

本功能旨在优化简历生成器的PDF下载和打印功能，解决当前在两页分界处内容被粗暴截断的问题。当简历内容超过一页时，系统应智能地在合适的位置进行分页，避免将同一个section（如"专业技能"、"项目经历"等）或同一条目（如一个工作经历条目）从中间截断。

## Glossary

- **PDF_Generator**: 负责将简历HTML内容转换为PDF文件的模块
- **Section**: 简历中的一个独立区块，如"工作经历"、"教育背景"、"专业技能"等
- **Section_Item**: Section内的单个条目，如一条工作经历、一个项目
- **Page_Break**: PDF中的分页点
- **A4_Page**: 标准A4纸张尺寸（210mm × 297mm）
- **Content_Block**: 不应被分页截断的最小内容单元

## Requirements

### Requirement 1: 智能分页避免Section标题孤立

**User Story:** As a 用户, I want 下载的PDF在分页时不会将section标题单独留在页面底部, so that 打印出来的简历看起来专业整洁。

#### Acceptance Criteria

1. WHEN PDF_Generator 检测到 Section 标题距离页面底部不足 40mm THEN THE PDF_Generator SHALL 将该 Section 整体移至下一页
2. WHEN Section 标题后紧跟的第一个条目无法在当前页完整显示 THEN THE PDF_Generator SHALL 将标题和第一个条目一起移至下一页

### Requirement 2: 避免条目内容被截断

**User Story:** As a 用户, I want 每个工作经历、项目经历等条目不会被分页截断, so that 阅读者可以完整地看到每个条目的信息。

#### Acceptance Criteria

1. WHEN 一个 Section_Item 的高度小于页面剩余空间 THEN THE PDF_Generator SHALL 在当前页完整显示该条目
2. WHEN 一个 Section_Item 的高度大于页面剩余空间但小于整页高度 THEN THE PDF_Generator SHALL 将该条目整体移至下一页
3. WHEN 一个 Section_Item 的高度超过整页高度 THEN THE PDF_Generator SHALL 在该条目的 highlight 列表项之间进行分页，而非在文字中间截断

### Requirement 3: 技能列表智能分页

**User Story:** As a 用户, I want 技能列表在分页时保持每个技能组的完整性, so that 技能信息清晰易读。

#### Acceptance Criteria

1. WHEN 一个技能组（如"Frontend: React, TypeScript..."）无法在当前页完整显示 THEN THE PDF_Generator SHALL 将该技能组整体移至下一页
2. WHEN 技能 Section 需要分页 THEN THE PDF_Generator SHALL 在技能组之间进行分页，而非在技能组内部截断

### Requirement 4: 分页后的视觉一致性

**User Story:** As a 用户, I want 分页后每页的内容布局保持一致的边距和间距, so that 打印出来的多页简历看起来统一专业。

#### Acceptance Criteria

1. WHEN 内容被移至新页 THEN THE PDF_Generator SHALL 在新页顶部保持与第一页相同的上边距（12mm）
2. WHEN 页面底部有剩余空间但不足以放置下一个完整内容块 THEN THE PDF_Generator SHALL 保留该空白而非强行填充部分内容

### Requirement 5: 打印预览一致性

**User Story:** As a 用户, I want 打印预览和实际下载的PDF分页效果一致, so that 我可以在下载前预览最终效果。

#### Acceptance Criteria

1. WHEN 用户点击打印按钮 THEN THE Print_Handler SHALL 应用与PDF下载相同的分页逻辑
2. THE CSS_Print_Styles SHALL 包含 page-break-inside: avoid 规则应用于所有 Content_Block 元素

### Requirement 6: 分页指示器（可选）

**User Story:** As a 用户, I want 在编辑时能看到分页位置的提示, so that 我可以调整内容以获得更好的分页效果。

#### Acceptance Criteria

1. WHERE 用户启用分页预览功能 THEN THE Preview_Component SHALL 在预计分页位置显示虚线指示器
2. WHEN 内容高度超过一页 THEN THE Preview_Component SHALL 显示当前预计的总页数
