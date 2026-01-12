# Design Document: All Text Editable

## Overview

本设计文档描述如何让所有简历模板支持全文字可编辑功能。目前 `ModernTemplate` 和 `MinimalTemplate` 已经实现了编辑功能，其他模板（ElegantTemplate、ClassicTemplate、CreativeTemplate、ProfessionalTemplate、ExecutiveTemplate、TechTemplate）需要添加相同的编辑能力。

## Architecture

### 现有编辑组件

项目中已有两套编辑方案：

1. **EditableField + EditableSection 方案**（ModernTemplate 使用）
   - `EditableField`: 可编辑字段组件，支持内联编辑和可见性控制
   - `EditableSection`: 可编辑区域组件，管理字段拖拽排序
   - `InlineEditor`: 内联编辑器，提供文本输入功能

2. **FreeDraggable 方案**（MinimalTemplate、ClassicTemplate 使用）
   - `FreeDraggable`: 自由拖拽组件，支持位置调整
   - 已有 `editable`、`value`、`onValueChange` 属性，但编辑功能未完全实现

### 统一方案

为保持一致性和减少代码重复，采用 **FreeDraggable + InlineEditor** 的组合方案：

1. 增强 `FreeDraggable` 组件，实现其 `editable` 相关属性的功能
2. 在编辑模式下，点击元素时显示 `InlineEditor`
3. 所有模板统一使用 `FreeDraggable` 组件

```
┌─────────────────────────────────────────────────────────┐
│                    Template Component                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │              FreeDraggable                       │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │  editMode=true && editable=true         │   │   │
│  │  │  ┌─────────────────────────────────┐   │   │   │
│  │  │  │      InlineEditor               │   │   │   │
│  │  │  │  - value                        │   │   │   │
│  │  │  │  - onValueChange                │   │   │   │
│  │  │  │  - multiline                    │   │   │   │
│  │  │  └─────────────────────────────────┘   │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### FreeDraggable 组件增强

```typescript
interface FreeDraggableProps {
  id: string;
  children: React.ReactNode;
  position?: { x: number; y: number };
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  disabled?: boolean;
  editMode?: boolean;
  className?: string;
  // 编辑相关属性（需要实现）
  editable?: boolean;           // 是否可编辑
  value?: string;               // 编辑值
  onValueChange?: (value: string) => void;  // 值变更回调
  editorClassName?: string;     // 编辑器样式
  multiline?: boolean;          // 是否多行编辑
}
```

### 编辑状态管理

每个 `FreeDraggable` 组件内部管理自己的编辑状态：

```typescript
const [isEditing, setIsEditing] = useState(false);

// 点击进入编辑模式
const handleClick = () => {
  if (editMode && editable && !isDragging) {
    setIsEditing(true);
  }
};

// 完成编辑
const handleBlur = () => {
  setIsEditing(false);
};
```

## Data Models

### ResumeData 更新流程

```
用户编辑 → FreeDraggable.onValueChange → Template.updateXxx → ResumeContext.setResumeData
```

各模板需要实现的更新函数：

```typescript
// 基本信息更新
const updateBasics = (field: string, value: string) => {
  setResumeData({ ...data, basics: { ...basics, [field]: value } });
};

// 经验更新
const updateExperience = (expId: string, field: string, value: string) => {
  const newExperience = experience.map(exp => 
    exp.id === expId ? { ...exp, [field]: value } : exp
  );
  setResumeData({ ...data, experience: newExperience });
};

// 教育更新
const updateEducation = (eduId: string, field: string, value: string) => {
  const newEducation = education.map(edu => 
    edu.id === eduId ? { ...edu, [field]: value } : edu
  );
  setResumeData({ ...data, education: newEducation });
};

// 项目更新
const updateProject = (projId: string, field: string, value: string) => {
  const newProjects = projects.map(proj => 
    proj.id === projId ? { ...proj, [field]: value } : proj
  );
  setResumeData({ ...data, projects: newProjects });
};

// 技能更新
const updateSkill = (skillId: string, field: string, value: string) => {
  const newSkills = skills.map(skill => 
    skill.id === skillId ? { ...skill, [field]: value } : skill
  );
  setResumeData({ ...data, skills: newSkills });
};

// 自定义模块更新
const updateCustomItem = (sectionId: string, itemId: string, field: string, value: string) => {
  const newCustom = custom.map(section => {
    if (section.id === sectionId) {
      const newItems = section.items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      );
      return { ...section, items: newItems };
    }
    return section;
  });
  setResumeData({ ...data, custom: newCustom });
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 编辑数据同步

*For any* 模板和任意可编辑字段，在编辑模式下修改值后，ResumeContext 中的数据应该正确更新为新值。

**Validates: Requirements 1.1-1.7, 2.1-2.2, 3.1-3.2, 4.1-4.2, 5.1-5.2, 6.1-6.2, 7.1-7.2, 8.2**

### Property 2: 编辑交互一致性

*For any* 模板，编辑交互应该保持一致：
- 点击可编辑元素进入编辑模式
- Enter 键确认编辑（单行）
- Escape 键取消编辑
- 点击外部区域完成编辑

**Validates: Requirements 8.3**

## Error Handling

### 编辑错误处理

1. **空值处理**: 允许空值，不做强制验证
2. **特殊字符**: 保留用户输入的所有字符
3. **编辑取消**: Escape 键恢复原值

### 状态同步错误

1. **数据不一致**: 使用 React 状态管理确保单向数据流
2. **并发编辑**: 每次只能编辑一个字段

## Testing Strategy

### 单元测试

1. **FreeDraggable 编辑功能测试**
   - 测试点击进入编辑模式
   - 测试 Enter/Escape 键行为
   - 测试值变更回调

2. **模板编辑功能测试**
   - 测试各字段的编辑功能
   - 测试数据更新是否正确

### 属性测试

使用 Vitest 进行属性测试：

1. **Property 1 测试**: 生成随机模板和字段，验证编辑后数据同步
2. **Property 2 测试**: 验证各模板的编辑交互行为一致

测试配置：
- 每个属性测试至少运行 100 次迭代
- 使用 `@fast-check/vitest` 进行属性测试
