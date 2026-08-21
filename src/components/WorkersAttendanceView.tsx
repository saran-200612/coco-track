import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export default function WorkersAttendanceView() {
  const qc = useQueryClient();
  const { data: workers = [] } = useQuery({ queryKey: ['workers'], queryFn: () => api.get('/workers').then(res => res.data) });
  
  const mark = useMutation({
    mutationFn: (data: any) => api.post('/attendance', data),
    onSuccess: () => qc.invalidateQueries()
  });

  return (
    <div className="space-y-5">
      <div className="glass-card flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-200">Workers & Attendance</h2>
        <input type="date" className="coco-input w-auto text-sm" defaultValue={new Date().toISOString().split('T')[0]} />
      </div>
      <div className="glass-card overflow-hidden p-0 border-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead><tr className="bg-slate-900/80 border-b border-slate-800"><th className="p-6 font-semibold text-slate-400 text-sm tracking-wider">Name</th><th className="p-6 font-semibold text-slate-400 text-sm tracking-wider">Type</th><th className="p-6 font-semibold text-slate-400 text-sm tracking-wider">Daily Rate</th><th className="p-6 font-semibold text-slate-400 text-sm tracking-wider">Mark Attendance</th></tr></thead>
            <tbody>
              {workers.map((w:any) => (
                <tr key={w.id} className="border-b border-slate-800/50 bg-slate-900/30 hover:bg-slate-800/30 transition-colors">
                  <td className="p-6 font-medium text-slate-200">{w.name}</td>
                  <td className="p-6"><span className="text-[10px] tracking-widest font-bold px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 uppercase">{w.workerType}</span></td>
                  <td className="p-6 text-slate-300">₹{w.defaultDailyRate || w.defaultClimbRatePerTree}</td>
                  <td className="p-6 flex gap-3">
                    <button onClick={() => mark.mutate({workerId: w.id, status: 'PRESENT'})} className="px-4 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold tracking-widest uppercase hover:bg-indigo-500 transition-colors">Present</button>
                    <button onClick={() => mark.mutate({workerId: w.id, status: 'ABSENT'})} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-slate-700 transition-colors">Absent</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
