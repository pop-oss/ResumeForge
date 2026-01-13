/**
 * PDF渲染器单元测试
 * Feature: smart-page-break-integration
 */

import { describe, it, expect } from 'vitest';
import { calculatePageSlices, PageSlice } from './pdfRenderer';

describe('calculatePageSlices', () => {
  // 测试正常分页点转换
  describe('正常分页点转换', () => {
    it('应该将单个分页点转换为单页切片', () => {
      const breakPoints = [0];
      const totalHeight = 1000;
      const scale = 2;

      const slices = calculatePageSlices(breakPoints, totalHeight, scale);

      expect(slices).toHaveLength(1);
      expect(slices[0]).toEqual({
        startY: 0,
        endY: 2000, // totalHeight * scale
        height: 2000,
      });
    });

    it('应该将多个分页点转换为多页切片', () => {
      const breakPoints = [0, 500, 1000];
      const totalHeight = 1500;
      const scale = 2;

      const slices = calculatePageSlices(breakPoints, totalHeight, scale);

      expect(slices).toHaveLength(3);
      expect(slices[0]).toEqual({
        startY: 0,
        endY: 1000, // 500 * scale
        height: 1000,
      });
      expect(slices[1]).toEqual({
        startY: 1000, // 500 * scale
        endY: 2000, // 1000 * scale
        height: 1000,
      });
      expect(slices[2]).toEqual({
        startY: 2000, // 1000 * scale
        endY: 3000, // totalHeight * scale
        height: 1000,
      });
    });

    it('应该正确处理不等高的分页', () => {
      const breakPoints = [0, 300, 800];
      const totalHeight = 1200;
      const scale = 1;

      const slices = calculatePageSlices(breakPoints, totalHeight, scale);

      expect(slices).toHaveLength(3);
      expect(slices[0].height).toBe(300);
      expect(slices[1].height).toBe(500);
      expect(slices[2].height).toBe(400);
    });
  });

  // 测试边界情况
  describe('边界情况', () => {
    it('应该处理空分页点数组', () => {
      const breakPoints: number[] = [];
      const totalHeight = 1000;
      const scale = 2;

      const slices = calculatePageSlices(breakPoints, totalHeight, scale);

      expect(slices).toHaveLength(1);
      expect(slices[0]).toEqual({
        startY: 0,
        endY: 2000,
        height: 2000,
      });
    });

    it('应该处理零高度内容', () => {
      const breakPoints = [0];
      const totalHeight = 0;
      const scale = 2;

      const slices = calculatePageSlices(breakPoints, totalHeight, scale);

      expect(slices).toHaveLength(1);
      expect(slices[0].height).toBe(0);
    });

    it('应该处理 scale 为 1 的情况', () => {
      const breakPoints = [0, 500];
      const totalHeight = 1000;
      const scale = 1;

      const slices = calculatePageSlices(breakPoints, totalHeight, scale);

      expect(slices).toHaveLength(2);
      expect(slices[0].startY).toBe(0);
      expect(slices[0].endY).toBe(500);
      expect(slices[1].startY).toBe(500);
      expect(slices[1].endY).toBe(1000);
    });

    it('应该处理高 scale 值', () => {
      const breakPoints = [0, 100];
      const totalHeight = 200;
      const scale = 3;

      const slices = calculatePageSlices(breakPoints, totalHeight, scale);

      expect(slices).toHaveLength(2);
      expect(slices[0].startY).toBe(0);
      expect(slices[0].endY).toBe(300); // 100 * 3
      expect(slices[1].startY).toBe(300);
      expect(slices[1].endY).toBe(600); // 200 * 3
    });
  });

  // 验证切片连续性
  describe('切片连续性', () => {
    it('所有切片应该连续无间隙', () => {
      const breakPoints = [0, 200, 450, 700, 900];
      const totalHeight = 1100;
      const scale = 2;

      const slices = calculatePageSlices(breakPoints, totalHeight, scale);

      // 验证每个切片的 endY 等于下一个切片的 startY
      for (let i = 0; i < slices.length - 1; i++) {
        expect(slices[i].endY).toBe(slices[i + 1].startY);
      }
    });

    it('第一个切片应该从 0 开始', () => {
      const breakPoints = [0, 500];
      const totalHeight = 1000;
      const scale = 2;

      const slices = calculatePageSlices(breakPoints, totalHeight, scale);

      expect(slices[0].startY).toBe(0);
    });

    it('最后一个切片应该到达总高度', () => {
      const breakPoints = [0, 500];
      const totalHeight = 1000;
      const scale = 2;

      const slices = calculatePageSlices(breakPoints, totalHeight, scale);

      expect(slices[slices.length - 1].endY).toBe(totalHeight * scale);
    });
  });
});
