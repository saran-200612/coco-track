import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { 
  ClipboardList, Plus, Clock, Trees, CheckCircle2, 
  ChevronRight, Calendar, User, Search, Filter, Sparkles
} from 'lucide-react';

export default function MobileDailyWorkLog() {
  const qc = useQueryClient();
  const { data: workers = [] } = useQuery({
    queryKey: ['workers'],
    queryFn: () => api.get('/workers').then((res) => res.data)
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['dailyWork'],
    queryFn: () => api.get('/daily-work').then((res) => res.data)
  });

  const [formData, setFormData] = useState({
    workerId: '',
    workDate: new Date().toISOString().split('T')[0],
    taskType: 'Climbing & Harvesting',
    durationHours: 6.0,
    treesCount: 45,
    notes: ''
  });

  const [filterWorker, setFilterWorker] = useState('ALL');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const taskPresets = [
    'Climbing & Harvesting',
    'Husk Peeling & Sorting',
    'Field De-weeding',
    'Irrigation & Basin Work',
    'Tractor Loading & Haulage',
    'Organic Fertilization'
  ];

  const saveLog = useMutation({
    mutationFn: (data: any) => api.post('/daily-work', data),
    onSuccess: () => {
      qc.invalidateQueries();
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      setFormData((prev) => ({
        ...prev,
        notes: ''
      }));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workerId) return;
    saveLog.mutate(formData);
  };

  const filteredLogs = logs.filter((l: any) => {
    if (filterWorker !== 'ALL' && l.worker_id !== filterWorker) return false;
    return true;
  });

  return (
    <div className="space-y-4 pb-safe">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto p-3.5 bg-emerald-500 text-slate-950 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold text-xs animate-in slide-in-from-top duration-300">
          <CheckCircle2 size={18} />
          <span>Work activity recorded successfully!</span>
        </div>
      )}

      {/* Mobile Entry Form */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Fast Field Entry</span>
            <h3 className="text-lg font-bold text-slate-100">Log Daily Activity</h3>
          </div>
          <span className="text-xs text-slate-400">{formData.workDate}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Worker Selector Pills */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Worker
            </label>
            <div className="grid grid-cols-2 gap-2">
              {workers.map((w: any) => {
                const isSelected = formData.workerId === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, workerId: w.id })}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-white text-indigo-700' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {w.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold truncate">{w.name}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {w.worker_type}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {!formData.workerId && (
              <p className="text-[11px] text-amber-400/80 mt-1.5">* Tap to assign a worker</p>
            )}
          </div>

          {/* Task Type Chips */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Activity Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {taskPresets.map((preset) => {
                const isSelected = formData.taskType === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormData({ ...formData, taskType: preset })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 ring-1 ring-indigo-400'
                        : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Steppers: Duration & Trees */}
          <div className="grid grid-cols-2 gap-3">
            {/* Hours Stepper */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Hours Worked</span>
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, durationHours: Math.max(0.5, p.durationHours - 0.5) }))}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 font-bold flex items-center justify-center active:scale-95 text-base"
                >
                  -
                </button>
                <span className="text-base font-bold text-slate-100 font-mono">{formData.durationHours}h</span>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, durationHours: p.durationHours + 0.5 }))}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 font-bold flex items-center justify-center active:scale-95 text-base"
                >
                  +
                </button>
              </div>
            </div>

            {/* Trees Stepper */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Trees Climbed</span>
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, treesCount: Math.max(0, p.treesCount - 5) }))}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 font-bold flex items-center justify-center active:scale-95 text-base"
                >
                  -
                </button>
                <span className="text-base font-bold text-slate-100 font-mono">{formData.treesCount}</span>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, treesCount: p.treesCount + 5 }))}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 font-bold flex items-center justify-center active:scale-95 text-base"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <input
              type="text"
              placeholder="Notes: e.g. North block grove completed"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="coco-input text-xs"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!formData.workerId || saveLog.isPending}
            className="w-full coco-btn-primary"
          >
            {saveLog.isPending ? 'Recording Entry...' : 'Save Activity Entry'}
          </button>
        </form>
      </div>

      {/* History Filter & Log List */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-bold text-slate-100">Work History</h4>
            <p className="text-xs text-slate-400">{filteredLogs.length} total activity records</p>
          </div>
          
          {/* Worker Filter Dropdown */}
          <select
            value={filterWorker}
            onChange={(e) => setFilterWorker(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300 outline-none"
          >
            <option value="ALL">All Crew</option>
            {workers.map((w: any) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5">
          {filteredLogs.map((log: any) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  <Trees size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{log.worker_name}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold uppercase">
                      {log.worker_type || 'Worker'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">{log.task_type}</p>
                  {log.notes && <p className="text-[11px] text-slate-500 mt-1 italic">"{log.notes}"</p>}
                  <span className="text-[10px] text-slate-500 block mt-1">{log.work_date}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-indigo-300 font-mono block">{log.duration_hours} hrs</span>
                {log.trees_count > 0 && (
                  <span className="text-[10px] text-emerald-400 font-semibold block">{log.trees_count} trees</span>
                )}
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">No records found for selected filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}
