/**
 * Template Card Component
 * 模板卡片组件 - 显示单个模板的预览信息
 */

import React from 'react';
import type { TemplateCardProps } from '../types';
import { useLanguage } from '../../../i18n';

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onClick,
  isSelected,
}) => {
  const { t } = useLanguage();

  return (
    <div
      onClick={onClick}
      className={`
        group relative cursor-pointer rounded-xl border-2 overflow-hidden
        transition-all duration-200 hover:shadow-lg
        ${isSelected 
          ? 'border-blue-500 ring-2 ring-blue-500/20' 
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
    >
      {/* Preview Image */}
      <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
        <img
          src={template.previewUrl}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=No+Preview';
          }}
        />
      </div>

      {/* Info Section */}
      <div className="p-3 bg-white">
        <h3 className="font-medium text-sm text-gray-900 truncate" title={template.name}>
          {template.name}
        </h3>
        
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <span className="capitalize">{template.source}</span>
          <span>•</span>
          <span className="capitalize">{template.style}</span>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-xs text-gray-400">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover Overlay with Details */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
        <div className="text-white">
          <h3 className="font-medium text-sm mb-1">{template.name}</h3>
          
          {template.description && (
            <p className="text-xs text-gray-300 line-clamp-2 mb-2">
              {template.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 text-xs">
            {template.metadata.author && (
              <span className="text-gray-300">
                {t.templateAuthor}: {template.metadata.author}
              </span>
            )}
            {template.metadata.rating && (
              <span className="text-yellow-400">
                ★ {template.metadata.rating.toFixed(1)}
              </span>
            )}
            {template.metadata.downloads && (
              <span className="text-gray-300">
                ↓ {template.metadata.downloads.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};
