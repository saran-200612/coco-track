import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export default function DailyWorkLogView() {
  const qc = useQueryClient();
  const { data: workers = [] } = useQuery({ queryKey: ['workers'], queryFn: () => api.get('/workers').then(res => res.data) });
  const { data: logs = [] } = useQuery({ queryKey: ['dailyWork'], queryFn: () => api.get('/daily-work').then(res => res.data) });
  
  const [formData, setFormData] = useState({
    workerId: '',
    workDate: new Date().toISOString().split('T')[0],
    taskType: '',
    durationHours: '',
    notes: ''
  });

  const saveLog = useMutation({
    mutationFn: (data: any) => api.post('/daily-work', data),
    onSuccess: () => {
      qc.invalidateQueries();
      setFormData({ ...formData, taskType: '', durationHours: '', notes: '' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workerId || !formData.taskType || !formData.durationHours) return;
    saveLog.mutate(formData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="glass-card col-span-1 h-fit">
        <h3 className="text-xl font-bold mb-6 text-slate-200">Log Activity</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Worker</label>
            <select 
              className="coco-input text-sm" 
              value={formData.workerId} 
              onChange={e => setFormData({...formData, workerId: e.target.value})}
              required
            >
              <option value="">Select a worker...</option>
              {workers.map((w:any) => <option key={w.id} value={w.id}>{w.name} ({w.workerType})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Date</label>
            <input 
              type="date" 
              className="coco-input text-sm" 
              value={formData.workDate} 
              onChange={e => setFormData({...formData, workDate: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Task Type</label>
            <input 
              type="text" 
              placeholder="e.g., Climbing, Harvesting, Maintenance"
              className="coco-input text-sm" 
              value={formData.taskType} 
              onChange={e => setFormData({...formData, taskType: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Duration (Hours)</label>
            <input 
              type="number" 
              step="0.5"
              min="0"
              placeholder="0.0"
              className="coco-input text-sm" 
              value={formData.durationHours} 
              onChange={e => setFormData({...formData, durationHours: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Notes</label>
            <textarea 
              rows={3}
              placeholder="Optional notes..."
              className="coco-input text-sm resize-none" 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            className="w-full mt-2 coco-btn-primary bg-indigo-600 hover:bg-indigo-500 text-white"
            disabled={saveLog.isPending}
          >
            {saveLog.isPending ? 'Saving...' : 'Record Activity'}
          </button>
        </form>
      </div>

      <div className="glass-card col-span-1 lg:col-span-2 overflow-hidden p-0 border-0 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-xl font-bold text-slate-200">Recent Logs</h3>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800">
                <th className="p-6 font-semibold text-slate-400 text-sm tracking-wider">Date</th>
                <th className="p-6 font-semibold text-slate-400 text-sm tracking-wider">Worker</th>
                <th className="p-6 font-semibold text-slate-400 text-sm tracking-wider">Task Type</th>
                <th className="p-6 font-semibold text-slate-400 text-sm tracking-wider">Duration</th>
                <th className="p-6 font-semibold text-slate-400 text-sm tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 italic">No daily work logs recorded yet.</td>
                </tr>
              ) : (
                logs.map((log:any) => (
                  <tr key={log.id} className="border-b border-slate-800/50 bg-slate-900/30 hover:bg-slate-800/30 transition-colors">
                    <td className="p-6 text-slate-300 text-sm">{log.work_date}</td>
                    <td className="p-6 font-medium text-slate-200">{log.worker_name}</td>
                    <td className="p-6"><span className="text-[10px] tracking-widest font-bold px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 uppercase">{log.task_type}</span></td>
                    <td className="p-6 text-slate-300 font-mono text-sm">{log.duration_hours} hrs</td>
                    <td className="p-6 text-slate-400 text-xs truncate max-w-[200px]">{log.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
