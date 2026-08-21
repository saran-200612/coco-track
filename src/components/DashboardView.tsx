import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Wallet, Users, Sprout, Tractor } from 'lucide-react';

export default function DashboardView() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: () => api.get('/dashboard/summary').then(res => res.data) });
  if (!data) return <div className="animate-pulse space-y-4"><div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl" /></div>;

  const mockBarData = [{ name: 'Mon', earned: 800, paid: 500 }, { name: 'Tue', earned: 950, paid: 950 }, { name: 'Wed', earned: 1100, paid: 0 }];
  const mockAreaData = [{ month: 'Jan', yield: 4000 }, { month: 'Feb', yield: 3000 }, { month: 'Mar', yield: 5500 }];

  const kpis = [
    { title: 'Total Trees', value: data.totalTrees, icon: Sprout, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { title: 'Workers Today', value: data.workersPresentToday, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { title: 'Owner Pending', value: `₹${data.ownerAmountPending}`, icon: Wallet, color: 'text-indigo-300', bg: 'bg-indigo-300/10' },
    { title: 'Vehicle Trips', value: data.vehicleTripsToday, icon: Tractor, color: 'text-indigo-200', bg: 'bg-indigo-200/10' }
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card flex flex-col justify-between relative overflow-hidden min-h-[300px]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] -mr-32 -mt-32"></div>
        <div className="z-10">
          <div className="text-indigo-500 font-mono text-xs tracking-[0.3em] mb-4 uppercase">Control Center</div>
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.05] tracking-tight">Coconut Estate<br/>Management.</h1>
        </div>
        <div className="z-10 flex items-center gap-4 text-slate-400 mt-8">
          <div className="h-px w-12 bg-slate-700"></div>
          <p className="text-sm max-w-xs">Manage field contracts, worker attendance, and harvest logistics seamlessly.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map(k => (
          <div key={k.title} className="glass-card flex flex-col justify-between p-6">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${k.bg}`}><k.icon className={`w-6 h-6 ${k.color}`} /></div>
            </div>
            <div className="mt-4">
              <div className="font-bold text-lg leading-tight">{k.title}</div>
              <div className="text-3xl font-bold mt-2">{k.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card h-80 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Weekly Wages (₹)</h3>
          <div className="flex-grow"><ResponsiveContainer width="100%" height="100%"><BarChart data={mockBarData}><XAxis dataKey="name" stroke="#64748b" /><YAxis stroke="#64748b" /><Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b'}} /><Bar dataKey="earned" fill="#4f46e5" radius={[4,4,0,0]} /><Bar dataKey="paid" fill="#818cf8" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="glass-card h-80 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Harvest Yield Trend (kg)</h3>
          <div className="flex-grow"><ResponsiveContainer width="100%" height="100%"><AreaChart data={mockAreaData}><XAxis dataKey="month" stroke="#64748b" /><YAxis stroke="#64748b" /><Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#1e293b'}} /><Area type="monotone" dataKey="yield" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  );
}
function TreesIcon(p:any){return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/></svg>}
