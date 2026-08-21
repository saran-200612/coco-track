import { Trees, Wifi, WifiOff, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../offline/db';

export default function Navbar({ activeTab, setActiveTab, isOnline }: any) {
  const [dark, setDark] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    const i = setInterval(async () => setPendingSync(await db.offlineMutations.count()), 2000);
    return () => clearInterval(i);
  }, [dark]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' }, { id: 'owners', label: 'Owners & Fields' },
    { id: 'workers', label: 'Workers' }, { id: 'daily-work', label: 'Daily Log' },
    { id: 'harvests', label: 'Harvests' }, { id: 'vehicles', label: 'Vehicles' },
    { id: 'reports', label: 'Reports' }
  ];

  return (
    <nav className="flex justify-between items-center overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-3 pr-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shrink-0"><Trees className="text-white" size={20} /></div>
        <h1 className="font-bold text-xl tracking-tighter shrink-0 uppercase">Coco<span className="text-slate-500 font-medium">Track</span></h1>
      </div>
      <div className="flex gap-8 min-w-max text-sm font-medium text-slate-400">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`transition-colors ${activeTab === t.id ? 'text-indigo-400 border-b-2 border-indigo-400 pb-1' : 'hover:text-slate-100 cursor-pointer'}`}>{t.label}</button>
        ))}
      </div>
      <div className="flex items-center gap-4 pl-4 shrink-0">
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="text-indigo-500" size={20} /> : <WifiOff className="text-slate-500" size={20} />}
          {pendingSync > 0 && <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md font-bold tracking-widest uppercase">{pendingSync} pending</span>}
        </div>
        <button onClick={() => setDark(!dark)} className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase shrink-0">Toggle Theme</button>
      </div>
    </nav>
  );
}
