/**
 * Template Search Dialog Component
 * 模板搜索对话框 - 主要的搜索界面
 */

import React, { useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../../../components/ui/button';
import { useAgent } from '../AgentContext';
import { useLanguage } from '../../../i18n';
import { TemplateGallery } from './TemplateGallery';
import { TemplateImporterDialog } from './TemplateImporterDialog';
import { Search, X, AlertCircle } from 'lucide-react';

export const TemplateSearchDialog: React.FC = () => {
  const { t } = useLanguage();
  const {
    isDialogOpen,
    closeSearchDialog,
    isSearching,
    searchResults,
    selectedTemplate,
    error,
    isImporting,
    search,
    selectTemplate,
    importTemplate,
    clearError,
  } = useAgent();

  const [inputValue, setInputValue] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Handle search submission
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      search(inputValue.trim());
    }
  }, [inputValue, search]);

  // Handle template selection
  const handleSelectTemplate = useCallback((template: typeof selectedTemplate) => {
    selectTemplate(template);
  }, [selectTemplate]);

  // Handle import button click
  const handleImportClick = useCallback(() => {
    if (selectedTemplate) {
      setShowImportDialog(true);
    }
  }, [selectedTemplate]);

  // Handle import confirmation
  const handleImportConfirm = useCallback(async () => {
    const success = await importTemplate();
    if (success) {
      setShowImportDialog(false);
      setInputValue('');
    }
  }, [importTemplate]);

  // Handle import cancel
  const handleImportCancel = useCallback(() => {
    setShowImportDialog(false);
  }, []);

  return (
    <>
      <Dialog.Root open={isDialogOpen} onOpenChange={(open) => !open && closeSearchDialog()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden z-40 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Dialog.Title className="text-lg font-semibold">
                {t.searchTemplates}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={closeSearchDialog}
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="p-4 border-b">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    disabled={isSearching}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSearching || !inputValue.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  {isSearching ? t.searching : t.searchTemplates}
                </Button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-700">{error.message}</p>
                  <button
                    onClick={clearError}
                    className="text-xs text-red-600 hover:text-red-800 mt-1"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
            )}

            {/* Gallery */}
            <div className="flex-1 overflow-y-auto p-4">
              <TemplateGallery
                templates={searchResults}
                onSelect={handleSelectTemplate}
                selectedTemplate={selectedTemplate}
                isLoading={isSearching}
              />
            </div>

            {/* Footer */}
            {selectedTemplate && (
              <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-12 bg-gray-200 rounded overflow-hidden">
                    <img
                      src={selectedTemplate.previewUrl}
                      alt={selectedTemplate.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedTemplate.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {selectedTemplate.style} • {selectedTemplate.source}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleImportClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {t.importTemplate}
                </Button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Import Confirmation Dialog */}
      {showImportDialog && selectedTemplate && (
        <TemplateImporterDialog
          template={selectedTemplate}
          onConfirm={handleImportConfirm}
          onCancel={handleImportCancel}
          isImporting={isImporting}
        />
      )}
    </>
  );
};
