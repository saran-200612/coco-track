import { useState, useEffect } from 'react';
import { X, RefreshCw, Wifi, WifiOff, Database, CheckCircle2, Clock, Trash2, ArrowUpRight } from 'lucide-react';
import { db, OfflineMutation } from '../offline/db';
import { synchronizeOfflineMutations } from '../offline/syncEngine';
import { useQueryClient } from '@tanstack/react-query';

interface SyncStatusSheetProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
}

export default function SyncStatusSheet({
  isOpen,
  onClose,
  isOnline
}: SyncStatusSheetProps) {
  const queryClient = useQueryClient();
  const [mutations, setMutations] = useState<OfflineMutation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadMutations = async () => {
    try {
      const items = await db.offlineMutations.toArray();
      setMutations(items.reverse());
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMutations();
      const interval = setInterval(loadMutations, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleForceSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      await synchronizeOfflineMutations(queryClient);
      await loadMutations();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearSynced = async () => {
    await db.offlineMutations.where('status').equals('SYNCING').delete();
    await loadMutations();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col">
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 shrink-0"></div>

        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Database className="text-indigo-400" size={20} />
            <div>
              <h3 className="text-base font-bold text-slate-100">Offline Sync Engine</h3>
              <p className="text-xs text-slate-400">
                {isOnline ? 'Online • Real-time DB Active' : 'Offline Mode • Queuing Local Data'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Network Status Card */}
        <div className={`p-4 rounded-2xl border mb-4 flex items-center justify-between ${
          isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
        }`}>
          <div className="flex items-center gap-3">
            {isOnline ? <Wifi size={20} className="text-emerald-400" /> : <WifiOff size={20} className="text-amber-400" />}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                {isOnline ? 'Connected to Cloud' : 'Field Offline Mode'}
              </div>
              <div className="text-xs opacity-80">
                {mutations.length} total local transactions recorded
              </div>
            </div>
          </div>
          {isOnline && (
            <button
              onClick={handleForceSync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
        </div>

        {/* Queue List */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Local Queue Items</span>
          <button onClick={handleClearSynced} className="text-[11px] text-slate-400 hover:text-slate-200">
            Clear Logs
          </button>
        </div>

        <div className="overflow-y-auto space-y-2 flex-1 pr-1">
          {mutations.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-600" />
              All offline logs are up to date.
            </div>
          ) : (
            mutations.map((m) => (
              <div
                key={m.clientId}
                className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-200 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                      {m.method}
                    </span>
                    <span>{m.endpoint}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(m.timestamp).toLocaleTimeString()} • {m.entityName}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  m.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {m.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
