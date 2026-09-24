import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { SUPABASE_URL, setCustomSupabaseCredentials, isSupabaseConfigured } from '../../supabase/client';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Key, ExternalLink, X, Copy } from 'lucide-react';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { isConfigured, dbError, refreshData, seedDatabase, isLoading, flats, visitors, bills } = useSociety();
  const [urlInput, setUrlInput] = useState(SUPABASE_URL.includes('placeholder') ? '' : SUPABASE_URL);
  const [keyInput, setKeyInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  if (!isOpen) return null;

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput || !keyInput) return;
    setCustomSupabaseCredentials(urlInput, keyInput);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    await seedDatabase();
    setIsSeeding(false);
  };

  const copySqlMigration = () => {
    const sqlUrl = '/supabase/migrations/001_initial_schema.sql';
    navigator.clipboard.writeText(`-- Palm Heights Smart Society Supabase Migration is located at ${sqlUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Supabase Database Connection</h3>
              <p className="text-xs text-slate-500">PostgreSQL Backend & Real-time State</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs text-slate-600 max-h-[80vh] overflow-y-auto">
          {/* Status summary */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            dbError ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}>
            {dbError ? (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="font-bold text-sm">
                {dbError ? 'Supabase Connection Notice' : 'Connected to Supabase'}
              </h4>
              <p className="text-xs leading-relaxed opacity-90">
                {dbError ? dbError : `Active endpoint: ${SUPABASE_URL}`}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                  Flats: <b>{flats.length}</b>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                  Visitors: <b>{visitors.length}</b>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                  Bills: <b>{bills.length}</b>
                </span>
              </div>
            </div>
          </div>

          {/* Seed button */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Database Seed & Initialization</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Populate all Palm Heights tables (Towers, Residents, Amenities, Staff, Gates) directly into Supabase.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSeed}
                disabled={isSeeding || isLoading}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                {isSeeding ? 'Seeding...' : 'Seed Records'}
              </button>
            </div>
          </div>

          {/* Credentials config */}
          <form onSubmit={handleSaveCredentials} className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-500" />
              <h4 className="font-bold text-slate-900 text-sm">Custom Project Credentials</h4>
            </div>
            <p className="text-[11px] text-slate-500">
              You can also specify credentials via <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">.env</code>: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">VITE_SUPABASE_URL</code> &amp; <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">VITE_SUPABASE_ANON_KEY</code>.
            </p>

            <div className="space-y-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Project URL:
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                  Public Anon Key:
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp..."
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-xs"
            >
              Apply Supabase Credentials
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
