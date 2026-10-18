import React, { useState } from 'react';
import { 
  Upload, FileText, Sparkles, CheckCircle2, ArrowRight, 
  AlertCircle, FileCheck, Download, Clock, Layers, Zap
} from 'lucide-react';
import { uploadContractFile, loadSample } from '../api';

export default function IngestView({ onAnalysisComplete }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste' | 'samples'
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);
  const [error, setError] = useState(null);

  const simulateProcessingSteps = () => {
    setProcessingStep(1);
    const t1 = setTimeout(() => setProcessingStep(2), 600);
    const t2 = setTimeout(() => setProcessingStep(3), 1300);
    const t3 = setTimeout(() => setProcessingStep(4), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF, DOCX, or TXT file to analyze.");
      return;
    }
    setError(null);
    setIsProcessing(true);
    const cleanup = simulateProcessingSteps();

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title.trim()) formData.append('title', title.trim());
      
      const result = await uploadContractFile(formData);
      setTimeout(() => {
        setIsProcessing(false);
        onAnalysisComplete(result.contract_id);
      }, 2300);
    } catch (err) {
      setIsProcessing(false);
      setError(err.message || "Failed to process contract document.");
      cleanup();
    }
  };

  const handlePasteSubmit = async (e) => {
    e.preventDefault();
    if (!pastedText.trim()) {
      setError("Please enter or paste your contract text.");
      return;
    }
    setError(null);
    setIsProcessing(true);
    const cleanup = simulateProcessingSteps();

    try {
      const formData = new FormData();
      formData.append('pasted_text', pastedText);
      if (title.trim()) formData.append('title', title.trim());

      const result = await uploadContractFile(formData);
      setTimeout(() => {
        setIsProcessing(false);
        onAnalysisComplete(result.contract_id);
      }, 2300);
    } catch (err) {
      setIsProcessing(false);
      setError(err.message || "Failed to process contract text.");
      cleanup();
    }
  };

  const handleLoadSample = async (sampleId) => {
    setError(null);
    setIsProcessing(true);
    const cleanup = simulateProcessingSteps();

    try {
      const result = await loadSample(sampleId);
      setTimeout(() => {
        setIsProcessing(false);
        onAnalysisComplete(result.contract_id);
      }, 2300);
    } catch (err) {
      setIsProcessing(false);
      setError(err.message || "Failed to load sample template.");
      cleanup();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Ingest & Analyze Contract
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Upload PDF/DOCX, paste contract terms, or run pre-loaded sample agreements.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'paste'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Paste Contract Text</span>
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'samples'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Preloaded Samples</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center space-x-3 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Processing Animation Modal / Overlay */}
      {isProcessing && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/60 shadow-xl text-center space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 animate-pulse">
            <Zap className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Agent Pipeline Executing
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ContractAI is systematically analyzing the document...
            </p>
          </div>

          {/* Stepper */}
          <div className="max-w-md mx-auto space-y-3 text-left">
            <div className={`flex items-center space-x-3 p-2.5 rounded-lg text-xs font-semibold ${
              processingStep >= 1 ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' : 'text-slate-400'
            }`}>
              <CheckCircle2 className={`h-4 w-4 ${processingStep >= 1 ? 'text-indigo-600' : 'text-slate-300'}`} />
              <span>Step 1: Ingesting text & splitting numbered legal sections</span>
            </div>
            <div className={`flex items-center space-x-3 p-2.5 rounded-lg text-xs font-semibold ${
              processingStep >= 2 ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' : 'text-slate-400'
            }`}>
              <CheckCircle2 className={`h-4 w-4 ${processingStep >= 2 ? 'text-indigo-600' : 'text-slate-300'}`} />
              <span>Step 2: Classifying clauses across 12 categories & summarizing</span>
            </div>
            <div className={`flex items-center space-x-3 p-2.5 rounded-lg text-xs font-semibold ${
              processingStep >= 3 ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' : 'text-slate-400'
            }`}>
              <CheckCircle2 className={`h-4 w-4 ${processingStep >= 3 ? 'text-indigo-600' : 'text-slate-300'}`} />
              <span>Step 3: Detecting uncapped liability, auto-renewal & generating rewrites</span>
            </div>
            <div className={`flex items-center space-x-3 p-2.5 rounded-lg text-xs font-semibold ${
              processingStep >= 4 ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' : 'text-slate-400'
            }`}>
              <CheckCircle2 className={`h-4 w-4 ${processingStep >= 4 ? 'text-indigo-600' : 'text-slate-300'}`} />
              <span>Step 4: Extracting obligations, responsible parties & deadlines</span>
            </div>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden max-w-md mx-auto">
            <div 
              className="bg-indigo-600 h-2 transition-all duration-500 rounded-full"
              style={{ width: `${processingStep * 25}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Tab 1: File Upload */}
      {!isProcessing && activeTab === 'upload' && (
        <form onSubmit={handleFileUpload} className="space-y-6">
          <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Upload className="h-7 w-7" />
              </div>
              {file ? (
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-base">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(file.size / 1024).toFixed(1)} KB • Ready to analyze
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-base">
                    Click to browse or drop your contract here
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Supports Adobe PDF (.pdf), Microsoft Word (.docx), and Plain Text (.txt)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Optional Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Contract Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Services Agreement 2026"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={!file}
            className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl font-bold text-white shadow-md transition-all ${
              file
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 cursor-pointer'
                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Launch Agent Pipeline</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* Tab 2: Paste Text */}
      {!isProcessing && activeTab === 'paste' && (
        <form onSubmit={handlePasteSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Contract Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Consulting Services Agreement"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Contract Clauses & Terms
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {pastedText.length} characters
              </span>
            </div>
            <textarea
              rows={12}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste contract sections, clauses, or full agreement text here..."
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={!pastedText.trim()}
            className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl font-bold text-white shadow-md transition-all ${
              pastedText.trim()
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 cursor-pointer'
                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Analyze Pasted Contract</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* Tab 3: Preloaded Samples */}
      {!isProcessing && activeTab === 'samples' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            These realistic sample contracts contain deliberate legal risks (auto-renewal traps, uncapped liabilities, one-sided termination) ideal for testing and viva demonstration:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Sample 1: MSA */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  High Risk Sample
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  Master Services Agreement (MSA)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Contains 90-day auto-renewal trap, uncapped client liability, one-sided convenience termination, and broad indemnity.
                </p>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={() => handleLoadSample('msa')}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Analyze Sample MSA</span>
                </button>
                <a
                  href="/api/samples/download/sample_msa_contract.docx"
                  download
                  className="w-full py-2 px-3 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 flex items-center justify-center space-x-1 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .DOCX</span>
                </a>
              </div>
            </div>

            {/* Sample 2: NDA */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Medium Risk Sample
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  Mutual Non-Disclosure Agreement
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Features perpetual confidentiality obligations, expansive trade secret definitions, and a $250k liquidated damages penalty.
                </p>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={() => handleLoadSample('nda')}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Analyze Sample NDA</span>
                </button>
                <a
                  href="/api/samples/download/sample_nda_contract.pdf"
                  download
                  className="w-full py-2 px-3 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 flex items-center justify-center space-x-1 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .PDF</span>
                </a>
              </div>
            </div>

            {/* Sample 3: SaaS SLA */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Medium Risk Sample
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  Enterprise SaaS Subscription SLA
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Vendor-favorable agreement with unilateral modification rights, immediate suspension penalties, and 'as-is' warranty disclaimers.
                </p>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={() => handleLoadSample('saas')}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Analyze Sample SaaS</span>
                </button>
                <a
                  href="/api/samples/download/sample_saas_agreement.docx"
                  download
                  className="w-full py-2 px-3 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 flex items-center justify-center space-x-1 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .DOCX</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
