# Implementation Plan: 同行字段独立拖拽

## Overview

修改 FreeDraggable 组件，将位置偏移从 margin 改为 transform，实现同行字段的独立拖拽能力。

## Tasks

- [x] 1. 修改 FreeDraggable 组件的位置偏移实现
  - [x] 1.1 将 offsetStyle 从 margin 改为 transform
    - 修改 `src/components/ui/free-draggable.tsx`
    - 将 `marginLeft` 和 `marginTop` 替换为 `transform: translate()`
    - _Requirements: 1.3, 2.1, 2.2_
  - [x] 1.2 更新碰撞检测逻辑以适应 transform
    - 确保 `checkCollision` 函数正确计算 transform 后的位置
    - _Requirements: 4.2_
  - [x] 1.3 确保拖拽手柄位置正确
    - 验证手柄在 transform 后仍然正确显示
    - _Requirements: 4.1_

- [x] 2. Checkpoint - 验证基本功能
  - 确保所有测试通过，手动验证拖拽行为
  - 如有问题请告知

- [x] 3. 添加属性测试
  - [x] 3.1 编写 Transform 样式正确性属性测试
    - **Property 2: 位置偏移正确性**
    - **Validates: Requirements 1.3, 2.1, 2.2**
  - [x] 3.2 编写碰撞检测属性测试
    - **Property 4: 碰撞检测准确性**
    - **Validates: Requirements 4.2, 4.3**

- [x] 4. Final Checkpoint - 确保所有测试通过
  - 运行完整测试套件
  - 如有问题请告知

## Notes

- 核心改动集中在 `src/components/ui/free-draggable.tsx` 文件
- 改动量小但影响所有使用 FreeDraggable 的模板
