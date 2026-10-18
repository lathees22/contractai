import React from 'react';
import { 
  FileSearch, AlertOctagon, CheckSquare, MessageSquareText, 
  ArrowRight, Sparkles, ShieldCheck, Zap, Upload, FileText, 
  Clock, CheckCircle, ChevronRight, Lock
} from 'lucide-react';

export default function LandingPage({ onGoToIngest, onQuickLoadSample, onGoToDashboard }) {
  const steps = [
    {
      num: "01",
      title: "READ & INGEST",
      icon: <FileSearch className="h-6 w-6 text-blue-500" />,
      desc: "Upload contracts in PDF, DOCX, or pasted text. ContractAI parses raw text and splits it into numbered legal sections."
    },
    {
      num: "02",
      title: "EXTRACT CLAUSES",
      icon: <Zap className="h-6 w-6 text-indigo-500" />,
      desc: "Classifies provisions into 12 core types (Payment, Liability, Termination, IP, etc.) and generates plain-English summaries."
    },
    {
      num: "03",
      title: "DETECT RISKS",
      icon: <AlertOctagon className="h-6 w-6 text-rose-500" />,
      desc: "Flags uncapped liabilities, auto-renewal traps, broad indemnities, and harsh penalties, complete with safer rewrites and 0-100 score."
    },
    {
      num: "04",
      title: "TRACK OBLIGATIONS",
      icon: <CheckSquare className="h-6 w-6 text-emerald-500" />,
      desc: "Extracts who is responsible, actionable duties, and upcoming deadlines into an interactive checklist and timeline view."
    }
  ];

  const clauseTypes = [
    "Payment", "Term & Renewal", "Termination", "Confidentiality", 
    "Liability", "Indemnification", "Non-Compete", "IP Rights", 
    "Governing Law", "Dispute Resolution", "Warranty", "Force Majeure"
  ];

  return (
    <div className="space-y-16 py-8">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
          <span>University Semester Project • ContractAI Agent System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          AI Contract Intelligence for <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Non-Lawyers</span>
        </h1>

        <p className="mt-5 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Never sign a bad contract again. ContractAI automatically reads contracts, classifies key clauses, exposes hidden risks with safer rewrites, and tracks your critical deadlines.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGoToIngest}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Upload className="h-5 w-5" />
            <span>Upload or Paste Contract</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
          <button
            onClick={() => onQuickLoadSample('msa')}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-sm transition-all"
          >
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>Test with Sample MSA</span>
          </button>
        </div>

        {/* Quick disclaimer banner */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Supports PDF, DOCX & Text • 100% Offline Rule-Based Fallback • Claude 3.5 Sonnet Integration</span>
        </div>
      </section>

      {/* 4-Step Agent Pipeline */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">
            Autonomous Pipeline Architecture
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            How ContractAI Evaluates Agreements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((st, idx) => (
            <div 
              key={idx}
              className="relative p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 group-hover:scale-105 transition-transform">
                  {st.icon}
                </div>
                <span className="text-2xl font-black text-slate-300 dark:text-slate-600 font-mono">
                  {st.num}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">
                {st.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 12 Clause Types Showcase */}
      <section className="max-w-6xl mx-auto px-4 bg-slate-100/70 dark:bg-slate-900/60 p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Clause Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Automatic 12-Category Classification
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
            ContractAI dissects complex legal language into plain English summaries across every essential business clause:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {clauseTypes.map((c, i) => (
            <div 
              key={i}
              className="flex items-center space-x-2 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
              <span>{c}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Key Advantages / Target Users */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold mb-4">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Risk Radar & Safer Rewrites</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Flags predatory clauses like uncapped damages and auto-renewal traps with color-coded High/Medium/Low badges and ready-to-copy balanced rewrites.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-4">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Obligation Checklist & Deadlines</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Never miss a 90-day non-renewal deadline or invoice payment. Tracks who is responsible, actionable requirements, and real-time status.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-4">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Interactive Chat with Citations</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Ask natural questions like "When can I cancel?" and receive plain-English answers backed by explicit section numbers and quoted contract clauses.
            </p>
          </div>
        </div>
      </section>

      {/* Target Users Banner */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-300">
              Designed For Non-Lawyers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Empowering Small Businesses, Legal Ops & Procurement
            </h2>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              Legal review can cost $400/hour and take days. ContractAI gives small business founders and non-lawyer procurement teams immediate visibility into liabilities and deadlines in seconds.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onGoToDashboard}
                className="px-5 py-2.5 rounded-xl font-semibold bg-white text-slate-900 hover:bg-slate-100 text-sm shadow-md transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={onGoToIngest}
                className="px-5 py-2.5 rounded-xl font-semibold bg-indigo-600/60 hover:bg-indigo-600 text-white text-sm border border-indigo-400/40 transition-colors"
              >
                Analyze New Contract
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
