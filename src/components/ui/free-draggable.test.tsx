import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FreeDraggable } from './free-draggable';

describe('FreeDraggable', () => {
  describe('基本渲染', () => {
    it('应该渲染子元素', () => {
      render(
        <FreeDraggable id="test">
          <span>测试内容</span>
        </FreeDraggable>
      );
      expect(screen.getByText('测试内容')).toBeInTheDocument();
    });

    it('应该在编辑模式下显示拖拽手柄', () => {
      render(
        <FreeDraggable id="test" editMode={true}>
          <span>测试内容</span>
        </FreeDraggable>
      );
      const handle = document.querySelector('.drag-handle');
      expect(handle).toBeInTheDocument();
    });

    it('应该在非编辑模式下隐藏拖拽手柄', () => {
      render(
        <FreeDraggable id="test" editMode={false}>
          <span>测试内容</span>
        </FreeDraggable>
      );
      const handle = document.querySelector('.drag-handle');
      expect(handle).not.toBeInTheDocument();
    });
  });

  describe('编辑功能', () => {
    it('当 editable=true 时应该渲染 InlineEditor', () => {
      render(
        <FreeDraggable
          id="test"
          editMode={true}
          editable={true}
          value="测试值"
          onValueChange={() => {}}
        >
          <span>原始内容</span>
        </FreeDraggable>
      );
      // InlineEditor 会渲染 value 作为 span 的内容
      expect(screen.getByText('测试值')).toBeInTheDocument();
    });

    it('当 editable=false 时应该渲染子元素', () => {
      render(
        <FreeDraggable
          id="test"
          editMode={true}
          editable={false}
          value="测试值"
        >
          <span>原始内容</span>
        </FreeDraggable>
      );
      expect(screen.getByText('原始内容')).toBeInTheDocument();
    });

    it('点击可编辑元素应该进入编辑模式', async () => {
      const user = userEvent.setup();
      render(
        <FreeDraggable
          id="test"
          editMode={true}
          editable={true}
          value="测试值"
          onValueChange={() => {}}
        >
          <span>原始内容</span>
        </FreeDraggable>
      );
      
      const editableElement = screen.getByText('测试值');
      await user.click(editableElement);
      
      // 点击后应该显示输入框
      const input = document.querySelector('input');
      expect(input).toBeInTheDocument();
    });

    it('编辑后应该调用 onValueChange', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(
        <FreeDraggable
          id="test"
          editMode={true}
          editable={true}
          value="原始值"
          onValueChange={handleChange}
        >
          <span>原始内容</span>
        </FreeDraggable>
      );
      
      // 点击进入编辑模式
      const editableElement = screen.getByText('原始值');
      await user.click(editableElement);
      
      // 输入新值
      const input = document.querySelector('input') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '新值');
      
      // 按 Enter 确认
      await user.keyboard('{Enter}');
      
      expect(handleChange).toHaveBeenCalledWith('新值');
    });

    it('按 Escape 应该取消编辑', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(
        <FreeDraggable
          id="test"
          editMode={true}
          editable={true}
          value="原始值"
          onValueChange={handleChange}
        >
          <span>原始内容</span>
        </FreeDraggable>
      );
      
      // 点击进入编辑模式
      const editableElement = screen.getByText('原始值');
      await user.click(editableElement);
      
      // 输入新值
      const input = document.querySelector('input') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, '新值');
      
      // 按 Escape 取消
      await user.keyboard('{Escape}');
      
      // 不应该调用 onValueChange
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('当 editMode=false 时不应该可编辑', async () => {
      const user = userEvent.setup();
      
      render(
        <FreeDraggable
          id="test"
          editMode={false}
          editable={true}
          value="测试值"
          onValueChange={() => {}}
        >
          <span>原始内容</span>
        </FreeDraggable>
      );
      
      // 应该渲染子元素而不是 InlineEditor
      expect(screen.getByText('原始内容')).toBeInTheDocument();
    });

    it('当 disabled=true 时不应该可编辑', async () => {
      const user = userEvent.setup();
      
      render(
        <FreeDraggable
          id="test"
          editMode={true}
          editable={true}
          disabled={true}
          value="测试值"
          onValueChange={() => {}}
        >
          <span>原始内容</span>
        </FreeDraggable>
      );
      
      const editableElement = screen.getByText('测试值');
      await user.click(editableElement);
      
      // 不应该显示输入框
      const input = document.querySelector('input');
      expect(input).not.toBeInTheDocument();
    });
  });

  describe('多行编辑', () => {
    it('multiline=true 时应该渲染 textarea', async () => {
      const user = userEvent.setup();
      
      render(
        <FreeDraggable
          id="test"
          editMode={true}
          editable={true}
          value="多行文本"
          onValueChange={() => {}}
          multiline={true}
        >
          <span>原始内容</span>
        </FreeDraggable>
      );
      
      const editableElement = screen.getByText('多行文本');
      await user.click(editableElement);
      
      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });
  });
});
