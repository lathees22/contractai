import React, { useState, useEffect } from 'react';
import { 
  FileText, AlertTriangle, ShieldCheck, Clock, CheckCircle2, 
  Trash2, ArrowRight, PlusCircle, Sparkles, AlertOctagon, 
  BarChart3, Calendar, ChevronRight, Layers, RefreshCw
} from 'lucide-react';
import { fetchDashboardStats, fetchContracts, deleteContract, updateObligationStatus } from '../api';

export default function DashboardView({ onSelectContract, onGoToIngest, onQuickLoadSample }) {
  const [stats, setStats] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, contractsData] = await Promise.all([
        fetchDashboardStats(),
        fetchContracts()
      ]);
      setStats(statsData);
      setContracts(contractsData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this contract?")) return;
    try {
      setDeletingId(id);
      await deleteContract(id);
      await loadData();
    } catch (err) {
      alert("Failed to delete contract: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getRiskBadge = (score, level) => {
    if (level === 'High' || score >= 70) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          <AlertOctagon className="h-3 w-3 mr-1 text-rose-600" />
          {score}/100 • High Risk
        </span>
      );
    }
    if (level === 'Medium' || score >= 35) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
          <AlertTriangle className="h-3 w-3 mr-1 text-amber-600" />
          {score}/100 • Medium Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
        <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" />
        {score}/100 • Low Risk
      </span>
    );
  };

  return (
    <div className="space-y-8 py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Contract Portfolio Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time risk radar, clause metrics, and pending business obligations.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onGoToIngest}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Ingest New Contract</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Contracts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Contracts
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.total_contracts ?? 0}
            </span>
            <span className="text-xs text-slate-500">agreements ingested</span>
          </div>
        </div>

        {/* Average Risk Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg. Risk Score
            </span>
            <div className={`p-2 rounded-xl ${
              (stats?.average_risk_score ?? 0) >= 60 
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
            }`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.average_risk_score ?? 0}
              <span className="text-base font-normal text-slate-400">/100</span>
            </span>
            <span className="text-xs text-slate-500">portfolio exposure</span>
          </div>
        </div>

        {/* Critical Risks Flagged */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Risks Flagged
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertOctagon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.critical_risks ?? 0}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">vulnerabilities</span>
          </div>
        </div>

        {/* Pending Obligations */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tracked Obligations
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.pending_obligations ?? 0}
            </span>
            <span className="text-xs text-slate-500">active deadlines</span>
          </div>
        </div>

      </div>

      {/* Risk Distribution Breakdown */}
      {contracts.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              <span>Risk Tier Distribution</span>
            </h3>
            <span className="text-xs text-slate-500">Color-coded severity classification</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
              <div className="flex justify-between items-center text-xs font-semibold text-rose-700 dark:text-rose-400">
                <span>High Risk (Score 70-100)</span>
                <span className="text-base font-bold">{stats?.high_risk_contracts ?? 0}</span>
              </div>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/70 mt-1">
                Uncapped liability, auto-renewal traps, or one-sided exit terms.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
              <div className="flex justify-between items-center text-xs font-semibold text-amber-700 dark:text-amber-400">
                <span>Medium Risk (Score 35-69)</span>
                <span className="text-base font-bold">{stats?.medium_risk_contracts ?? 0}</span>
              </div>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-400/70 mt-1">
                Broad indemnity, harsh penalties, or perpetual secrecy provisions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
              <div className="flex justify-between items-center text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span>Low Risk (Score 0-34)</span>
                <span className="text-base font-bold">{stats?.low_risk_contracts ?? 0}</span>
              </div>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/70 mt-1">
                Balanced reciprocal clauses with standard commercial protections.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contracts Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Ingested Contracts
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any contract to inspect clauses, risk rewrites, obligations timeline, and AI chat.
            </p>
          </div>
          {contracts.length === 0 && (
            <button
              onClick={() => onQuickLoadSample('msa')}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Load Sample MSA</span>
            </button>
          )}
        </div>

        {contracts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
              No contracts ingested yet
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              Upload your own contract in PDF/DOCX or load a pre-configured sample contract with one click.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={onGoToIngest}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Upload Contract
              </button>
              <button
                onClick={() => onQuickLoadSample('msa')}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
              >
                Load Sample MSA
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Contract Title</th>
                  <th className="px-4 py-3.5 font-semibold">Type</th>
                  <th className="px-4 py-3.5 font-semibold">Risk Rating</th>
                  <th className="px-4 py-3.5 font-semibold">Clauses</th>
                  <th className="px-4 py-3.5 font-semibold">Risks</th>
                  <th className="px-4 py-3.5 font-semibold">Obligations</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {contracts.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectContract(c.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-750/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {c.title}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        {c.filename || 'pasted-text'} • {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="uppercase text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {c.file_type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {getRiskBadge(c.risk_score, c.risk_level)}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {c.total_clauses} clauses
                    </td>
                    <td className="px-4 py-4 font-medium text-rose-600 dark:text-rose-400">
                      {c.total_risks} flagged
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {c.total_obligations} tasks
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                          Inspect <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                        </span>
                        <button
                          onClick={(e) => handleDelete(e, c.id)}
                          disabled={deletingId === c.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Contract"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
