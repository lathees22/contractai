import React, { useState, useEffect } from 'react';
import { 
  FileText, AlertTriangle, ShieldCheck, Clock, CheckCircle2, 
  AlertOctagon, Copy, Check, MessageSquareText, Search, 
  Calendar, ListFilter, ArrowLeft, Download, Trash2, 
  Sparkles, ExternalLink, Send, ChevronDown, ChevronUp, Layers
} from 'lucide-react';
import { 
  fetchContractDetail, updateObligationStatus, sendChatMessage, 
  fetchChatHistory, deleteContract 
} from '../api';

export default function ContractDetailView({ contractId, onBack, onDeleteComplete }) {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clauses'); // 'clauses' | 'risks' | 'obligations' | 'chat' | 'sections'
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  // Clause filtering
  const [selectedClauseType, setSelectedClauseType] = useState('All');
  const [clauseSearch, setClauseSearch] = useState('');
  
  // Risk filtering
  const [riskSeverityFilter, setRiskSeverityFilter] = useState('All');

  // Obligation view & filter
  const [obligationViewMode, setObligationViewMode] = useState('checklist'); // 'checklist' | 'timeline'
  const [obligationStatusFilter, setObligationStatusFilter] = useState('All');

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Full text section search
  const [sectionSearch, setSectionSearch] = useState('');

  const loadContract = async () => {
    try {
      setLoading(true);
      const data = await fetchContractDetail(contractId);
      setContract(data);
      const history = await fetchChatHistory(contractId);
      setChatMessages(history);
    } catch (err) {
      console.error("Failed to load contract:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractId) {
      loadContract();
    }
  }, [contractId]);

  const handleCopyRewrite = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleToggleObligation = async (obligationId, currentStatus) => {
    const nextStatus = currentStatus === 'Pending' ? 'Done' : (currentStatus === 'Done' ? 'Overdue' : 'Pending');
    try {
      await updateObligationStatus(obligationId, nextStatus);
      setContract(prev => ({
        ...prev,
        obligations: prev.obligations.map(ob => ob.id === obligationId ? { ...ob, status: nextStatus } : ob)
      }));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleSendMessage = async (msgToSend) => {
    const text = msgToSend || chatInput;
    if (!text.trim() || sendingChat) return;

    const userMsg = { id: Date.now(), role: 'user', content: text, cited_clauses: [] };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setSendingChat(true);

    try {
      const response = await sendChatMessage(contractId, text);
      setChatMessages(prev => [...prev, response]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Sorry, I encountered an error answering your question. Please try again.",
        cited_clauses: []
      }]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleExportReport = () => {
    if (!contract) return;
    const reportData = {
      title: contract.title,
      date_analyzed: contract.created_at,
      risk_score: contract.risk_score,
      risk_level: contract.risk_level,
      executive_summary: contract.summary,
      total_clauses: contract.clauses.length,
      risks: contract.risks,
      obligations: contract.obligations
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contract.title.replace(/\s+/g, '_')}_Analysis_Report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !contract) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-slate-500">Loading contract intelligence...</p>
      </div>
    );
  }

  // Filter clauses
  const filteredClauses = contract.clauses.filter(c => {
    const matchesType = selectedClauseType === 'All' || c.clause_type.toLowerCase() === selectedClauseType.toLowerCase();
    const matchesSearch = !clauseSearch || 
      c.plain_summary.toLowerCase().includes(clauseSearch.toLowerCase()) || 
      c.original_text.toLowerCase().includes(clauseSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Filter risks
  const filteredRisks = contract.risks.filter(r => {
    if (riskSeverityFilter === 'All') return true;
    return r.severity.toLowerCase() === riskSeverityFilter.toLowerCase();
  });

  // Filter obligations
  const filteredObligations = contract.obligations.filter(ob => {
    if (obligationStatusFilter === 'All') return true;
    return ob.status.toLowerCase() === obligationStatusFilter.toLowerCase();
  });

  // Clause categories list
  const clauseTypes = [
    "All", "Payment", "Term & Renewal", "Termination", "Confidentiality", 
    "Liability", "Indemnification", "Non-Compete", "IP", 
    "Governing Law", "Dispute Resolution", "Warranty", "Force Majeure"
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportReport}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Report (JSON)</span>
          </button>
        </div>
      </div>

      {/* Contract Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="uppercase text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {contract.file_type}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Ingested {new Date(contract.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {contract.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {contract.summary}
            </p>
          </div>

          {/* Risk Score Meter */}
          <div className="flex-shrink-0 flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-750">
            <div className="relative flex items-center justify-center">
              <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-bold text-white shadow-md ${
                contract.risk_score >= 70 ? 'bg-gradient-to-tr from-rose-600 to-red-500' :
                contract.risk_score >= 35 ? 'bg-gradient-to-tr from-amber-600 to-yellow-500' :
                'bg-gradient-to-tr from-emerald-600 to-teal-500'
              }`}>
                <span className="text-xl font-extrabold leading-none">{contract.risk_score}</span>
                <span className="text-[9px] uppercase font-mono tracking-tighter opacity-80">/100</span>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Overall Risk Assessment
              </div>
              <div className={`text-base font-bold ${
                contract.risk_score >= 70 ? 'text-rose-600 dark:text-rose-400' :
                contract.risk_score >= 35 ? 'text-amber-600 dark:text-amber-400' :
                'text-emerald-600 dark:text-emerald-400'
              }`}>
                {contract.risk_level} Risk Contract
              </div>
              <div className="text-[11px] text-slate-500">
                {contract.risks.length} flagged risks • {contract.obligations.length} deadlines
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex space-x-2 sm:space-x-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('clauses')}
            className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'clauses'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Clause Extraction ({contract.clauses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('risks')}
            className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'risks'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <AlertOctagon className="h-4 w-4" />
            <span>Risk Radar & Rewrites ({contract.risks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('obligations')}
            className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'obligations'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Obligations & Deadlines ({contract.obligations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'chat'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <MessageSquareText className="h-4 w-4" />
            <span>Chat with Contract</span>
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'sections'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Full Sections ({contract.sections.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: CLAUSE EXTRACTION */}
      {/* ============================================================== */}
      {activeTab === 'clauses' && (
        <div className="space-y-6">
          
          {/* Controls: Search and Categories */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search clauses..."
                value={clauseSearch}
                onChange={(e) => setClauseSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 max-w-2xl">
              {clauseTypes.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedClauseType(t)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    selectedClauseType.toLowerCase() === t.toLowerCase()
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Clauses List */}
          {filteredClauses.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No clauses found for the selected category or search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredClauses.map((clause, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {clause.clause_type}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {clause.section_reference || 'General Section'}
                      </span>
                    </div>

                    {/* Plain English Summary Callout */}
                    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 mb-3">
                      <div className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 tracking-wider mb-0.5">
                        Plain-English Summary (Non-Lawyer)
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {clause.plain_summary}
                      </p>
                    </div>

                    {/* Original Contract Language */}
                    <div className="mt-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                        Original Contract Language
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 font-mono text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 max-h-36 overflow-y-auto leading-relaxed">
                        {clause.original_text}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Confidence: {(clause.confidence * 100).toFixed(0)}%</span>
                    <button
                      onClick={() => handleSendMessage(`Explain the ${clause.clause_type} clause in simple terms and tell me if it favors me.`)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      Ask AI about this clause &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: RISK RADAR & REWRITES */}
      {/* ============================================================== */}
      {activeTab === 'risks' && (
        <div className="space-y-6">
          
          {/* Risk Severity Filters */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 mr-2">Severity:</span>
            {['All', 'High', 'Medium', 'Low'].map((sev, idx) => (
              <button
                key={idx}
                onClick={() => setRiskSeverityFilter(sev)}
                className={`text-xs px-3 py-1 rounded-lg font-bold transition-colors ${
                  riskSeverityFilter.toLowerCase() === sev.toLowerCase()
                    ? sev === 'High' ? 'bg-rose-600 text-white' :
                      sev === 'Medium' ? 'bg-amber-600 text-white' :
                      sev === 'Low' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {filteredRisks.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No risks flagged for the selected severity level.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredRisks.map((risk, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        risk.severity === 'High'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                          : risk.severity === 'Medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                      }`}>
                        {risk.severity} Severity Risk
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {risk.risk_type}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {risk.section_reference || 'Contract'}
                    </span>
                  </div>

                  {/* Explanation */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                    {risk.explanation}
                  </p>

                  {/* Problematic Quote */}
                  {risk.clause_reference && (
                    <div className="p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
                      <div className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 tracking-wider mb-1">
                        Flagged Contract Language:
                      </div>
                      <blockquote className="text-xs font-mono text-rose-950 dark:text-rose-200/90 italic">
                        "{risk.clause_reference}"
                      </blockquote>
                    </div>
                  )}

                  {/* Safer Alternative Rewrite Card */}
                  {risk.safer_rewrite && (
                    <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          <span>Suggested Safer Rewrite (Negotiation Clause)</span>
                        </div>
                        <button
                          onClick={() => handleCopyRewrite(risk.safer_rewrite, idx)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-200 transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Clause</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs font-mono text-emerald-900 dark:text-emerald-200 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-3 rounded-lg border border-emerald-200/50 dark:border-emerald-900/40">
                        {risk.safer_rewrite}
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Copy this proposed substitute clause directly into your counter-offer or markup.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: OBLIGATIONS & DEADLINES */}
      {/* ============================================================== */}
      {activeTab === 'obligations' && (
        <div className="space-y-6">
          
          {/* Controls: Mode & Status Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* View Mode Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
              <button
                onClick={() => setObligationViewMode('checklist')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  obligationViewMode === 'checklist'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Checklist View
              </button>
              <button
                onClick={() => setObligationViewMode('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  obligationViewMode === 'timeline'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Timeline / Calendar View
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-500 font-semibold mr-1">Status:</span>
              {['All', 'Pending', 'Done', 'Overdue'].map((st, i) => (
                <button
                  key={i}
                  onClick={() => setObligationStatusFilter(st)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    obligationStatusFilter.toLowerCase() === st.toLowerCase()
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist Mode */}
          {obligationViewMode === 'checklist' && (
            <div className="space-y-3">
              {filteredObligations.map((ob) => (
                <div
                  key={ob.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleToggleObligation(ob.id, ob.status)}
                      className={`mt-0.5 p-1 rounded-md transition-colors ${
                        ob.status === 'Done'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                          : ob.status === 'Overdue'
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                          : 'bg-slate-100 text-slate-400 hover:text-slate-600 dark:bg-slate-700'
                      }`}
                      title="Click to toggle status (Pending -> Done -> Overdue)"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          {ob.party}
                        </span>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center space-x-1">
                          <Clock className="h-3 w-3 inline" />
                          <span>{ob.deadline}</span>
                        </span>
                      </div>
                      <p className={`text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed ${
                        ob.status === 'Done' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}>
                        {ob.action}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0 self-end sm:self-center">
                    <span className="text-[11px] font-mono text-slate-400">
                      Due: {ob.due_date || 'Ongoing'}
                    </span>
                    <button
                      onClick={() => handleToggleObligation(ob.id, ob.status)}
                      className={`text-xs px-2.5 py-1 rounded-full font-bold transition-transform active:scale-95 ${
                        ob.status === 'Done'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : ob.status === 'Overdue'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      }`}
                    >
                      {ob.status}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timeline / Calendar Mode */}
          {obligationViewMode === 'timeline' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <span>Chronological Deadline Timeline</span>
                </h3>
                <span className="text-xs text-slate-500">Scheduled sequence of actions</span>
              </div>

              <div className="relative pl-6 border-l-2 border-indigo-200 dark:border-indigo-900 space-y-6">
                {contract.obligations.map((ob, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline bullet */}
                    <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-800 bg-indigo-600"></div>
                    
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-750">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {ob.deadline}
                        </span>
                        <span className="font-mono text-slate-400">
                          Target: {ob.due_date || 'Relative Deadline'}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Responsible: <span className="text-slate-900 dark:text-white font-bold">{ob.party}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {ob.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CHAT WITH CONTRACT */}
      {/* ============================================================== */}
      {activeTab === 'chat' && (
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col h-[650px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  ContractAI Assistant
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ask questions about cancellation, liabilities, and obligations with clause citations.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-950/50 flex flex-wrap gap-1.5">
            {[
              "When can I cancel this agreement?",
              "Is there an auto-renewal trap?",
              "What are my payment deadlines & penalties?",
              "Is my liability capped or unlimited?",
              "What happens if there is an IP dispute?"
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={sendingChat}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatMessages.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <MessageSquareText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Ask any question about this contract.</p>
                <p className="text-xs mt-1">ContractAI will quote the exact clause and section supporting the answer.</p>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-750'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Cited Clauses Box */}
                  {msg.cited_clauses && msg.cited_clauses.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2">
                      <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                        Referenced Contract Clauses:
                      </div>
                      {msg.cited_clauses.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <div className="flex items-center justify-between font-semibold text-indigo-600 dark:text-indigo-300 text-[11px] mb-1">
                            <span>{c.section_reference || 'Contract'}</span>
                            <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              {c.clause_type}
                            </span>
                          </div>
                          <blockquote className="font-mono text-[10px] text-slate-500 dark:text-slate-400 italic">
                            "{c.quote}"
                          </blockquote>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sendingChat && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
                <div className="h-2 w-2 rounded-full bg-indigo-600 animate-ping"></div>
                <span>ContractAI is reviewing clauses...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex items-center space-x-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question about this contract (e.g. Can I terminate early?)..."
              disabled={sendingChat}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || sendingChat}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: FULL NUMBERED SECTIONS */}
      {/* ============================================================== */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Contract split into {contract.sections.length} numbered legal sections:
            </span>
            <div className="relative w-64">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search sections..."
                value={sectionSearch}
                onChange={(e) => setSectionSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            {contract.sections
              .filter(sec => !sectionSearch || sec.content.toLowerCase().includes(sectionSearch.toLowerCase()) || sec.section_title.toLowerCase().includes(sectionSearch.toLowerCase()))
              .map((sec, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {sec.section_number}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {sec.section_title}
                    </span>
                  </div>
                  <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
                    {sec.content}
                  </pre>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
}
