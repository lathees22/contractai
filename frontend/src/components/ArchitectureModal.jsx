import React, { useState } from 'react';
import { X, BookOpen, Layers, Terminal, Sparkles, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'prompts' | 'viva'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Semester Project Architecture & Viva Guide
              </h2>
              <p className="text-xs text-slate-500">Agent pipeline specification, exact prompts, and oral exam prep.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'pipeline'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Agent Pipeline Architecture
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'prompts'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Exact Claude Prompts
          </button>
          <button
            onClick={() => setActiveTab('viva')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'viva'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Viva Exam Q&A Prep
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          
          {/* TAB 1: PIPELINE */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm mb-1">
                  The ContractAI Agent Workflow
                </h3>
                <p className="text-xs text-indigo-800/80 dark:text-indigo-300 leading-relaxed">
                  ContractAI operates as a modular multi-stage legal intelligence agent. Rather than treating legal contracts as a single unformatted text blob, it executes an orchestrated 4-stage pipeline:
                </p>
              </div>

              {/* Step cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white mb-2">
                    <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-mono text-xs">1</span>
                    <span>READ & INGESTION</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Uses PyPDF for binary PDF stream decoding and python-docx for Word document paragraph/table traversal. Regex segmentation divides the document into numbered hierarchical sections (Articles, Sections, Clauses).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white mb-2">
                    <span className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-mono text-xs">2</span>
                    <span>CLAUSE CLASSIFICATION</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Categorizes provisions into 12 core legal buckets (Payment, Term, Termination, Liability, Indemnity, IP, etc.) and synthesizes a plain-English translation tailored for business non-lawyers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white mb-2">
                    <span className="h-6 w-6 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 flex items-center justify-center font-mono text-xs">3</span>
                    <span>RISK RADAR & REWRITES</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Pattern triggers detect uncapped liabilities, evergreen auto-renewal traps, unilateral convenience exits, and broad indemnification. Evaluates High/Medium/Low severity and provides ready-to-copy balanced substitutes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white mb-2">
                    <span className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-mono text-xs">4</span>
                    <span>OBLIGATION TRACKING</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Extracts modal verbs ("shall", "must") into actionable checklists with assigned parties, condition triggers, deadlines (e.g. Net 15, 90-day non-renewal), and calendar timeline views.
                  </p>
                </div>

              </div>

              {/* Chat Citation Stage */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white mb-1.5">
                  <span className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center font-mono text-xs">5</span>
                  <span>CITATION-BACKED CONVERSATIONAL Q&A</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  When users ask questions like "When can I cancel?", the agent searches parsed clauses, quotes the supporting sentence, and links the user directly to the section reference.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PROMPTS */}
          {activeTab === 'prompts' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Below are the production system prompts used by ContractAI when querying Claude 3.5 Sonnet:
              </p>

              <div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. Analysis & Extraction System Prompt:
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`You are ContractAI, an expert AI legal contract analyst specializing in helping small business owners, legal teams, and procurement managers who are NOT lawyers.

Your job is to read the provided contract text and output a structured JSON analysis containing:
1. Executive Summary: 2-3 sentences explaining the nature and scope of the agreement.
2. Clauses: Extract and classify key clauses into exactly one of these 12 categories:
   Payment, Term & Renewal, Termination, Confidentiality, Liability, Indemnification, Non-Compete, IP, Governing Law, Dispute Resolution, Warranty, Force Majeure.
   For each clause provide: clause_type, original_text, plain_summary, section_reference, confidence (0.0 to 1.0).
3. Risks: Identify dangerous wording (unlimited liability, auto-renewal, one-sided termination, broad indemnity, penalties, perpetual obligations).
   Provide: risk_type, severity (High/Medium/Low), explanation, safer_rewrite, clause_reference, section_reference.
4. Obligations: Extract actionable duties (party, action, deadline, status: "Pending").
5. Overall Risk Score: Integer from 0 (Safe) to 100 (Extremely Dangerous/Predatory).`}
                </pre>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  2. Citation-Backed Q&A System Prompt:
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`You are ContractAI Assistant. You answer questions from users about their contract.
Crucial rules:
1. Always cite the exact Section Number and Clause Type relevant to the answer.
2. Provide a clear, direct answer in plain English for non-lawyers.
3. Quote the specific sentence or phrase from the contract that supports your answer.
4. Add a quick practical recommendation if the clause poses a risk.
5. If the contract does not mention the topic, clearly state that it is not covered.
Include a JSON block at the end with cited clauses:
[ { "clause_type": "...", "section_reference": "...", "quote": "...", "explanation": "..." } ]`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: VIVA PREP */}
          {activeTab === 'viva' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs">
                <strong>Viva Pro-Tip:</strong> Examiners love hearing about the <em>hybrid architecture</em> (how the system is both LLM-capable AND resilient with offline rule-based heuristics).
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    Q: Why use a hybrid rule-based + LLM approach?
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    A: In enterprise and academic settings, external LLMs can face latency, cost, and API rate limits. The rule-based engine provides instantaneous, deterministic clause matching and risk detection offline, while the LLM mode offers deeper contextual nuance.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    Q: How is the overall risk score (0-100) calculated?
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    A: It uses a weighted formula where High-severity risks (such as uncapped liability or auto-renewal traps) contribute +24 points each, Medium risks contribute +12 points, and baseline commercial factors add +15 points, normalized to a 0–100 scale.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    Q: How does the Q&A engine prevent hallucinations?
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    A: ContractAI implements a strict retrieval and citation constraint. Every answer must point directly to an extracted section and quote the underlying contractual phrase, giving the user transparent verification.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
