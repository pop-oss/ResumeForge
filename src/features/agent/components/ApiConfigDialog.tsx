/**
 * API Configuration Dialog Component
 * API 配置对话框 - 用于配置 AI 服务的 API 密钥
 */

import React, { useState, useCallback, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../../../components/ui/button';
import { useLanguage } from '../../../i18n';
import { Settings, X, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { API_CONFIG } from '../constants';

// Storage key for API configuration
const API_CONFIG_STORAGE_KEY = 'agent_api_config';

interface ApiConfig {
  apiKey: string;
  provider: 'openai' | 'anthropic' | 'custom';
  baseUrl?: string;
}

interface ApiConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Get stored API config
export function getStoredApiConfig(): ApiConfig | null {
  try {
    const stored = localStorage.getItem(API_CONFIG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

// Save API config
export function saveApiConfig(config: ApiConfig): void {
  localStorage.setItem(API_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

// Clear API config
export function clearApiConfig(): void {
  localStorage.removeItem(API_CONFIG_STORAGE_KEY);
}

// Validate API key format
function validateApiKey(key: string, provider: string): { valid: boolean; message?: string } {
  if (!key.trim()) {
    return { valid: false, message: 'API key is required' };
  }

  if (provider === 'openai' && !key.startsWith('sk-')) {
    return { valid: false, message: 'OpenAI API key should start with "sk-"' };
  }

  if (key.length < 20) {
    return { valid: false, message: 'API key seems too short' };
  }

  return { valid: true };
}

export const ApiConfigDialog: React.FC<ApiConfigDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'custom'>('openai');
  const [baseUrl, setBaseUrl] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [validation, setValidation] = useState<{ valid: boolean; message?: string } | null>(null);
  const [saved, setSaved] = useState(false);

  // Load existing config on mount
  useEffect(() => {
    if (open) {
      const config = getStoredApiConfig();
      if (config) {
        setApiKey(config.apiKey);
        setProvider(config.provider);
        setBaseUrl(config.baseUrl || '');
      }
      setSaved(false);
      setValidation(null);
    }
  }, [open]);

  // Validate on key change
  useEffect(() => {
    if (apiKey) {
      setValidation(validateApiKey(apiKey, provider));
    } else {
      setValidation(null);
    }
  }, [apiKey, provider]);

  // Handle save
  const handleSave = useCallback(() => {
    const validationResult = validateApiKey(apiKey, provider);
    setValidation(validationResult);

    if (validationResult.valid) {
      saveApiConfig({
        apiKey,
        provider,
        baseUrl: baseUrl || undefined,
      });
      setSaved(true);
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    }
  }, [apiKey, provider, baseUrl, onOpenChange]);

  // Handle clear
  const handleClear = useCallback(() => {
    clearApiConfig();
    setApiKey('');
    setProvider('openai');
    setBaseUrl('');
    setValidation(null);
    setSaved(false);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-full max-w-md z-50 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t.configureApi}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Provider Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as typeof provider)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* API Key Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.apiKey}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t.apiKeyPlaceholder}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  validation && !validation.valid
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {validation && !validation.valid && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validation.message}
              </p>
            )}
          </div>

          {/* Custom Base URL (for custom provider) */}
          {provider === 'custom' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          )}

          {/* Success Message */}
          {saved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Configuration saved successfully!</span>
            </div>
          )}

          {/* Info */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              Your API key is stored locally in your browser and is never sent to our servers.
              It is only used to communicate directly with the AI provider.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
              Clear
            </Button>
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim() || saved}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t.saveConfig}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
