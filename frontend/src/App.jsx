import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import DashboardView from './components/DashboardView';
import IngestView from './components/IngestView';
import ContractDetailView from './components/ContractDetailView';
import SettingsModal from './components/SettingsModal';
import ArchitectureModal from './components/ArchitectureModal';
import { loadSample, fetchContractDetail } from './api';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard' | 'ingest' | 'detail'
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [activeContract, setActiveContract] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  
  // Dark mode state with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('contractai_dark_mode') === 'true' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('contractai_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('contractai_dark_mode', 'false');
    }
  }, [darkMode]);

  // Load contract details when ID changes
  useEffect(() => {
    if (selectedContractId) {
      fetchContractDetail(selectedContractId)
        .then(data => setActiveContract(data))
        .catch(err => console.error("Could not fetch active contract", err));
    } else {
      setActiveContract(null);
    }
  }, [selectedContractId]);

  const handleSelectContract = (id) => {
    setSelectedContractId(id);
    setCurrentView('detail');
  };

  const handleAnalysisComplete = (newContractId) => {
    setSelectedContractId(newContractId);
    setCurrentView('detail');
  };

  const handleQuickLoadSample = async (sampleId = 'msa') => {
    try {
      const res = await loadSample(sampleId);
      handleAnalysisComplete(res.contract_id);
    } catch (err) {
      alert("Failed to load sample: " + err.message);
    }
  };

  const handleDeleteComplete = () => {
    setSelectedContractId(null);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onQuickLoadSample={() => handleQuickLoadSample('msa')}
        activeContract={activeContract}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {currentView === 'landing' && (
          <LandingPage
            onGoToIngest={() => setCurrentView('ingest')}
            onQuickLoadSample={handleQuickLoadSample}
            onGoToDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            onSelectContract={handleSelectContract}
            onGoToIngest={() => setCurrentView('ingest')}
            onQuickLoadSample={handleQuickLoadSample}
          />
        )}

        {currentView === 'ingest' && (
          <IngestView
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {currentView === 'detail' && selectedContractId && (
          <ContractDetailView
            contractId={selectedContractId}
            onBack={() => setCurrentView('dashboard')}
            onDeleteComplete={handleDeleteComplete}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">ContractAI</span>
            <span>• University Semester Project • Advanced AI Agent System</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-amber-600 dark:text-amber-400 font-medium">Disclaimer: For educational & risk screening purposes only. Not legal advice.</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

    </div>
  );
}
