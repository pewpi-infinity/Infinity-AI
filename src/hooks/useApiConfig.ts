import { useState, useEffect } from 'react';
import type { ApiConfig } from '../types';

const STORAGE_KEY = 'infinity-ai-config';

export function useApiConfig() {
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as ApiConfig) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (apiConfig) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apiConfig));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [apiConfig]);

  const saveConfig = (config: ApiConfig) => {
    setApiConfig(config);
  };

  const clearConfig = () => {
    setApiConfig(null);
  };

  return { apiConfig, saveConfig, clearConfig };
}
