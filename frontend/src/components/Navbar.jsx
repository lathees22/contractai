import React from 'react';
import { 
  FileText, Shield, Moon, Sun, Settings, BookOpen, 
  Sparkles, PlusCircle, AlertTriangle, Layers
} from 'lucide-react';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  darkMode, 
  setDarkMode, 
  onOpenSettings,
  onOpenArchitecture,
  onQuickLoadSample,
  activeContract
}) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('landing')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-800 dark:from-white dark:via-slate-200 dark:to-blue-400 bg-clip-text text-transparent">
                  ContractAI
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                  AI Legal Agent
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Read • Extract • Detect • Track
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'landing'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('ingest')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'ingest'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Ingest Contract</span>
            </button>
            {activeContract && (
              <button
                onClick={() => setCurrentView('detail')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'detail'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span className="truncate max-w-[130px]">{activeContract.title}</span>
              </button>
            )}
            <button
              onClick={onOpenArchitecture}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
              title="Architecture & Viva Project Guide"
            >
              <BookOpen className="h-4 w-4" />
              <span>Viva Guide</span>
            </button>
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center space-x-2">
            {/* Quick Sample Selector */}
            <button
              onClick={onQuickLoadSample}
              className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 dark:text-indigo-300 transition-colors shadow-sm"
              title="Load Pre-analyzed Sample for instant demo"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
              <span>Test Sample</span>
            </button>

            {/* Disclaimer pill */}
            <div className="hidden sm:flex items-center space-x-1 text-[11px] font-medium text-amber-700 dark:text-amber-300/90 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-1 rounded-md">
              <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0" />
              <span>Not legal advice</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="AI Engine Settings & Prompts"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
