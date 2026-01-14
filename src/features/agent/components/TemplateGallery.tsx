/**
 * Template Gallery Component
 * 模板画廊组件 - 以网格布局展示搜索结果
 */

import React from 'react';
import type { TemplateGalleryProps } from '../types';
import { TemplateCard } from './TemplateCard';
import { useLanguage } from '../../../i18n';
import { Loader2, Search } from 'lucide-react';

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates,
  onSelect,
  selectedTemplate,
  isLoading,
  emptyMessage,
}) => {
  const { t } = useLanguage();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm">{t.searching}</p>
      </div>
    );
  }

  // Empty state
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Search className="w-12 h-12 mb-3 text-gray-300" />
        <p className="text-sm font-medium">{emptyMessage || t.noResults}</p>
        <p className="text-xs mt-1">{t.noResultsHint}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onClick={() => onSelect(template)}
          isSelected={selectedTemplate?.id === template.id}
        />
      ))}
    </div>
  );
};
