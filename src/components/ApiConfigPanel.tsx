import { useState } from 'react';
import { Key, Server, Bot, Eye, EyeOff, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import type { ApiConfig, ModelProvider } from '../types';

interface ApiConfigPanelProps {
  onSave: (config: ApiConfig) => void;
  existing?: ApiConfig | null;
  onClose?: () => void;
}

export function ApiConfigPanel({ onSave, existing, onClose }: ApiConfigPanelProps) {
  const [provider, setProvider] = useState<ModelProvider>(
    existing?.provider ?? 'anthropic'
  );
  const [apiKey, setApiKey] = useState(existing?.apiKey ?? '');
  const [endpoint, setEndpoint] = useState(existing?.endpoint ?? '');
  const [apiVersion, setApiVersion] = useState(
    existing?.apiVersion ?? '2024-12-01-preview'
  );
  const [deploymentName, setDeploymentName] = useState(
    existing?.deploymentName ?? 'o1'
  );
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testError, setTestError] = useState('');

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    setTestError('');
    try {
      if (provider === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 16,
            messages: [{ role: 'user', content: 'Hi' }],
          }),
        });
        if (res.ok || res.status === 200) {
          setTestResult('success');
        } else {
          const err = await res.text();
          setTestError(`HTTP ${res.status}: ${err.slice(0, 120)}`);
          setTestResult('error');
        }
      } else {
        if (!endpoint.trim()) {
          setTestError('Azure endpoint is required');
          setTestResult('error');
          return;
        }
        const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hi' }],
            max_completion_tokens: 16,
          }),
        });
        if (res.ok || res.status === 200) {
          setTestResult('success');
        } else {
          const err = await res.text();
          setTestError(`HTTP ${res.status}: ${err.slice(0, 120)}`);
          setTestResult('error');
        }
      }
    } catch (e) {
      setTestError(e instanceof Error ? e.message : String(e));
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!apiKey.trim()) return;
    const config: ApiConfig = {
      provider,
      apiKey: apiKey.trim(),
      ...(provider === 'azure-openai'
        ? {
            endpoint: endpoint.trim(),
            apiVersion: apiVersion.trim(),
            deploymentName: deploymentName.trim(),
          }
        : {}),
    };
    onSave(config);
    onClose?.();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          AI Provider
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setProvider('anthropic')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              provider === 'anthropic'
                ? 'border-violet-500 bg-violet-500/10 text-white'
                : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Bot className="w-5 h-5 text-violet-400 shrink-0" />
            <div className="text-left">
              <div className="font-medium text-sm">Anthropic</div>
              <div className="text-xs opacity-70">Claude 3.5 Sonnet</div>
            </div>
          </button>
          <button
            onClick={() => setProvider('azure-openai')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              provider === 'azure-openai'
                ? 'border-blue-500 bg-blue-500/10 text-white'
                : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Server className="w-5 h-5 text-blue-400 shrink-0" />
            <div className="text-left">
              <div className="font-medium text-sm">Azure OpenAI</div>
              <div className="text-xs opacity-70">o1 / o3-mini</div>
            </div>
          </button>
        </div>
      </div>

      {/* API Key */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Key className="inline w-4 h-4 mr-1 -mt-0.5" />
          API Key
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={
              provider === 'anthropic'
                ? 'sk-ant-...'
                : 'Your Azure OpenAI API key'
            }
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1.5">
          {provider === 'anthropic'
            ? 'Get your key from console.anthropic.com'
            : 'Found in Azure Portal → AI Foundry → Keys and Endpoint'}
        </p>
      </div>

      {/* Azure-specific fields */}
      {provider === 'azure-openai' && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Server className="inline w-4 h-4 mr-1 -mt-0.5" />
              Azure Endpoint
            </label>
            <input
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://YOUR-RESOURCE.openai.azure.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Deployment Name
              </label>
              <input
                type="text"
                value={deploymentName}
                onChange={(e) => setDeploymentName(e.target.value)}
                placeholder="o1"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                API Version
              </label>
              <input
                type="text"
                value={apiVersion}
                onChange={(e) => setApiVersion(e.target.value)}
                placeholder="2024-12-01-preview"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </>
      )}

      {/* Test Result */}
      {testResult && (
        <div
          className={`flex items-start gap-3 p-3 rounded-xl text-sm ${
            testResult === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {testResult === 'success' ? (
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <span>
            {testResult === 'success'
              ? 'Connection successful! API key is valid.'
              : testError || 'Connection failed. Check your credentials.'}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleTest}
          disabled={!apiKey.trim() || testing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors text-white"
        >
          <Zap className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
          {testing ? 'Testing…' : 'Test Connection'}
        </button>
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors text-white"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}
