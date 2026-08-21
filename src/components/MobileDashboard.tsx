import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { 
  Sprout, Users, Wallet, Tractor, ArrowUpRight, CloudSun, 
  Calendar, AlertCircle, ChevronRight, CheckCircle2, TrendingUp,
  Clock, Sparkles, MapPin
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

interface MobileDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenQuickAction: () => void;
}

export default function MobileDashboard({ onNavigateTab, onOpenQuickAction }: MobileDashboardProps) {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard/summary').then((res) => res.data)
  });

  const { data: fields = [] } = useQuery({
    queryKey: ['fields'],
    queryFn: () => api.get('/fields').then((res) => res.data)
  });

  const { data: recentWork = [] } = useQuery({
    queryKey: ['dailyWork'],
    queryFn: () => api.get('/daily-work').then((res) => res.data)
  });

  const chartData = [
    { day: 'Mon', nuts: 850, wages: 1200 },
    { day: 'Tue', nuts: 1100, wages: 1450 },
    { day: 'Wed', nuts: 920, wages: 1100 },
    { day: 'Thu', nuts: 1400, wages: 1900 },
    { day: 'Fri', nuts: 1250, wages: 1600 },
    { day: 'Sat', nuts: 1600, wages: 2100 },
    { day: 'Sun', nuts: 900, wages: 950 }
  ];

  if (isLoading || !summary) {
    return (
      <div className="space-y-4 animate-pulse pb-safe">
        <div className="h-32 bg-slate-900 rounded-3xl"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-28 bg-slate-900 rounded-3xl"></div>
          <div className="h-28 bg-slate-900 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-safe">
      {/* Weather & Field Readiness Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/20 p-5 shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
              <Sparkles size={13} />
              <span>Today's Field Conditions</span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight">
              Optimal for Harvest
            </h2>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-200">
            <CloudSun size={18} className="text-amber-400" />
            <span className="text-sm font-bold">{summary.weather?.temp || 28}°C</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
          <div>
            <span className="text-[10px] text-slate-400 font-medium">Humidity</span>
            <p className="text-sm font-bold text-slate-200">{summary.weather?.humidity || 72}%</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium">Wind Speed</span>
            <p className="text-sm font-bold text-slate-200">{summary.weather?.windKmh || 14} km/h</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium">Climbers</span>
            <p className="text-sm font-bold text-emerald-400">Ready</p>
          </div>
        </div>
      </div>

      {/* 4 Main Mobile KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div 
          onClick={() => onNavigateTab('more')}
          className="glass-card p-4 flex flex-col justify-between active:scale-[0.98] transition-transform cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sprout size={18} />
            </div>
            <ArrowUpRight size={14} className="text-slate-500" />
          </div>
          <div className="mt-3">
            <span className="text-[11px] text-slate-400 font-medium">Active Trees</span>
            <h3 className="text-2xl font-bold text-slate-100 mt-0.5 tracking-tight">{summary.totalTrees}</h3>
            <span className="text-[10px] text-slate-500">{summary.totalFields} Managed Blocks</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('workers')}
          className="glass-card p-4 flex flex-col justify-between active:scale-[0.98] transition-transform cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users size={18} />
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
              Active
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] text-slate-400 font-medium">On-Duty Crew</span>
            <h3 className="text-2xl font-bold text-slate-100 mt-0.5 tracking-tight">
              {summary.workersPresentToday} / {summary.totalWorkers || 4}
            </h3>
            <span className="text-[10px] text-emerald-400">Punch Attendance &gt;</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('harvests')}
          className="glass-card p-4 flex flex-col justify-between active:scale-[0.98] transition-transform cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp size={18} />
            </div>
            <span className="text-[10px] text-amber-400 font-medium">Aug '26</span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] text-slate-400 font-medium">Harvested Nuts</span>
            <h3 className="text-2xl font-bold text-slate-100 mt-0.5 tracking-tight">{summary.coconutsHarvestedMonth || 7000}</h3>
            <span className="text-[10px] text-slate-500">₹{(summary.coconutsHarvestedMonth || 7000) * 25} Est. Value</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('more')}
          className="glass-card p-4 flex flex-col justify-between active:scale-[0.98] transition-transform cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Wallet size={18} />
            </div>
            <span className="text-[10px] text-rose-400 font-medium">Pending</span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] text-slate-400 font-medium">Lease Payable</span>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5 tracking-tight">₹{summary.ownerAmountPending}</h3>
            <span className="text-[10px] text-slate-500">₹{summary.ownerAmountPaid} settled</span>
          </div>
        </div>
      </div>

      {/* Quick Field Actions Bar */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quick Field Actions</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onNavigateTab('daily-work')}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 active:bg-slate-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Sprout size={18} />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Log Tree</span>
          </button>

          <button
            onClick={() => onNavigateTab('workers')}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 active:bg-slate-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users size={18} />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Crew</span>
          </button>

          <button
            onClick={() => onNavigateTab('harvests')}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 active:bg-slate-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Harvest</span>
          </button>

          <button
            onClick={() => onNavigateTab('vehicles')}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 active:bg-slate-800 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Tractor size={18} />
            </div>
            <span className="text-[11px] font-medium text-slate-300">Transit</span>
          </button>
        </div>
      </div>

      {/* Harvest Trend Visualizer */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-200">Daily Coconut Yield</h4>
            <p className="text-[11px] text-slate-400">Weekly nut collection trend</p>
          </div>
          <span className="text-xs font-bold text-indigo-400">Total 8,020 nuts</span>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="nutGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="nuts" stroke="#6366f1" strokeWidth={2.5} fill="url(#nutGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent On-Field Logs */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-200">Today's Field Activity</h4>
          <button
            onClick={() => onNavigateTab('daily-work')}
            className="text-xs text-indigo-400 font-semibold flex items-center gap-1"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentWork.slice(0, 3).map((item: any) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  {item.worker_name?.charAt(0) || 'W'}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-200">{item.worker_name}</h5>
                  <p className="text-[11px] text-slate-400">{item.task_type}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-indigo-300 font-mono">{item.duration_hours}h</span>
                <span className="block text-[10px] text-slate-500">
                  {item.trees_count ? `${item.trees_count} trees` : 'Completed'}
                </span>
              </div>
            </div>
          ))}
          {recentWork.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-xs">No activity logged yet today.</div>
          )}
        </div>
      </div>
    </div>
  );
}
