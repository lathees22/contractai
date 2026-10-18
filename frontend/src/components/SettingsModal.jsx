import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, ShieldCheck, Check, Sparkles, AlertCircle } from 'lucide-react';
import { fetchSettings, saveSettings } from '../api';

export default function SettingsModal({ isOpen, onClose }) {
  const [aiMode, setAiMode] = useState('rule_based');
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [engineStatus, setEngineStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const data = await fetchSettings();
      setAiMode(data.ai_mode || 'rule_based');
      setHasApiKey(data.has_api_key);
      setMaskedKey(data.masked_api_key);
      setEngineStatus(data.engine_status);
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await saveSettings({
        ai_mode: aiMode,
        anthropic_api_key: apiKey.trim() ? apiKey.trim() : (hasApiKey ? undefined : '')
      });
      setSavedSuccess(true);
      await loadSettings();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Engine & API Settings
              </h2>
              <p className="text-xs text-slate-500">Configure LLM provider and fallback execution.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          {/* Active Engine Status Pill */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center space-x-3 text-xs">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <div>
              <span className="font-semibold text-indigo-900 dark:text-indigo-200">Current Active Engine: </span>
              <span className="font-mono text-indigo-700 dark:text-indigo-300">{engineStatus || 'Rule-Based Offline Engine'}</span>
            </div>
          </div>

          {/* Engine Mode Radio Options */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Analysis Engine Mode
            </label>

            {/* Option 1: Rule-Based */}
            <label className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              aiMode === 'rule_based'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 dark:border-indigo-500'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="aiMode"
                value="rule_based"
                checked={aiMode === 'rule_based'}
                onChange={() => setAiMode('rule_based')}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>⚡ Hybrid Rule-Based Engine (Recommended for Viva)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                    100% Free & Offline
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Extracts all 12 clauses, detects predatory risks (uncapped liability, auto-renewal traps, broad indemnity), generates rewrites, and cites clauses instantly with zero API costs.
                </p>
              </div>
            </label>

            {/* Option 2: Claude LLM */}
            <label className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              aiMode === 'claude'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 dark:border-indigo-500'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="aiMode"
                value="claude"
                checked={aiMode === 'claude'}
                onChange={() => setAiMode('claude')}
                className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>🤖 Claude 3.5 Sonnet (Anthropic API)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Sends contract text to Anthropic Claude 3.5 with strict structured JSON schemas. Requires an active Anthropic API key.
                </p>
              </div>
            </label>
          </div>

          {/* Anthropic API Key input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Anthropic API Key
              </label>
              {hasApiKey && (
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  Key saved: {maskedKey}
                </span>
              )}
            </div>
            <div className="relative">
              <Key className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasApiKey ? "Leave blank to keep existing key" : "sk-ant-api03-..."}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Your key is saved locally in SQLite and never transmitted anywhere else.
            </p>
          </div>

          {/* Save Status / Notification */}
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Settings and engine mode updated successfully!</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all flex items-center space-x-1.5"
            >
              {saving ? <span>Saving...</span> : <span>Save Settings</span>}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
