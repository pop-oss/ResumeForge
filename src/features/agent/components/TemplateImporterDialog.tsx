/**
 * Template Importer Dialog Component
 * 模板导入确认对话框
 */

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../../../components/ui/button';
import type { TemplateImporterProps } from '../types';
import { useLanguage } from '../../../i18n';
import { Loader2, X, Download } from 'lucide-react';

export const TemplateImporterDialog: React.FC<TemplateImporterProps> = ({
  template,
  onConfirm,
  onCancel,
  isImporting,
}) => {
  const { t } = useLanguage();

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-md z-50">
          <div className="flex items-start justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">
              {t.importTemplate}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={onCancel}
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Template Preview */}
          <div className="flex gap-4 mb-6">
            <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={template.previewUrl}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x128?text=Preview';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{template.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {template.description || 'No description available'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-0.5 bg-gray-100 rounded capitalize">
                  {template.style}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 rounded capitalize">
                  {template.source}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              导入模板将应用新的样式设置。您当前的简历内容将保留。
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isImporting}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isImporting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.importing}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {t.confirm}
                </>
              )}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
