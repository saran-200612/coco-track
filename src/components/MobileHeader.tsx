import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Bell, ChevronDown, CheckCircle2, CloudOff, Trees } from 'lucide-react';
import { db } from '../offline/db';

interface MobileHeaderProps {
  isOnline: boolean;
  onOpenSync: () => void;
  onOpenQuickAction: () => void;
  selectedEstate: string;
  setSelectedEstate: (estate: string) => void;
}

export default function MobileHeader({
  isOnline,
  onOpenSync,
  selectedEstate,
  setSelectedEstate
}: MobileHeaderProps) {
  const [time, setTime] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkPending = async () => {
      try {
        const count = await db.offlineMutations.where('status').equals('PENDING').count();
        setPendingCount(count);
      } catch (e) {
        // ignore
      }
    };
    checkPending();
    const interval = setInterval(checkPending, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSyncClick = () => {
    setIsSyncing(true);
    onOpenSync();
    setTimeout(() => setIsSyncing(false), 800);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#09090B]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 pt-2 pb-3 transition-all">
      {/* Mobile Top Status Bar */}
      <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 px-1 mb-2 tracking-tight">
        <span>{time || '09:41'}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">5G</span>
            {isOnline ? (
              <Wifi size={13} className="text-emerald-400" />
            ) : (
              <WifiOff size={13} className="text-amber-400 animate-pulse" />
            )}
          </div>
          <div className="w-5 h-2.5 border border-slate-400 rounded-xs p-0.5 flex items-center">
            <div className="w-full h-full bg-emerald-400 rounded-xs"></div>
          </div>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/20">
            <Trees size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 font-medium tracking-wide">ESTATE</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
            </div>
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="text-sm font-bold text-slate-100 tracking-tight">{selectedEstate}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          {/* Offline / Sync Badge Button */}
          <button
            onClick={handleSyncClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              !isOnline
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : pendingCount > 0
                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
            }`}
          >
            {!isOnline ? (
              <>
                <CloudOff size={13} className="text-amber-400" />
                <span>Offline</span>
              </>
            ) : pendingCount > 0 ? (
              <>
                <RefreshCw size={13} className={`text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{pendingCount} Pending</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Synced</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
