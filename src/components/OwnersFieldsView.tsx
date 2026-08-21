import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function OwnersFieldsView() {
  const { data: owners = [] } = useQuery({ queryKey: ['owners'], queryFn: () => api.get('/owners').then(res => res.data) });
  const { data: fields = [] } = useQuery({ queryKey: ['fields'], queryFn: () => api.get('/fields').then(res => res.data) });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="glass-card col-span-1">
        <h3 className="text-xl font-bold mb-4 flex justify-between items-center text-slate-200">Owners <button className="text-[10px] bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-md tracking-widest font-bold uppercase">+ Add</button></h3>
        <div className="space-y-3">
          {owners.map((o:any) => (
            <div key={o.id} className="p-4 border border-slate-800 bg-slate-900/30 rounded-2xl cursor-pointer hover:bg-slate-800/50 transition-colors">
              <h4 className="font-semibold text-slate-100">{o.name}</h4><p className="text-sm text-slate-500 mt-1">{o.phone}</p>
            </div>
          ))}
          {owners.length === 0 && <p className="text-slate-500">No owners found.</p>}
        </div>
      </div>
      <div className="glass-card col-span-1 lg:col-span-2">
        <h3 className="text-xl font-bold mb-4 text-slate-200">Contracted Fields</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map((f:any) => (
            <div key={f.id} className="p-6 border border-slate-800 bg-slate-900/30 rounded-2xl relative hover:border-indigo-500/30 transition-colors">
              <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md uppercase tracking-widest">ACTIVE</span>
              <h4 className="font-bold text-lg text-slate-100">{f.name}</h4>
              <p className="text-xs text-slate-500 mb-4 mt-1">{f.location} • {f.areaAcres} Acres</p>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex justify-between text-sm">
                <div><span className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Trees</span><span className="font-semibold text-slate-200">{f.treeCount}</span></div>
                <div><span className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Contract (₹)</span><span className="font-semibold text-slate-200">{f.agreedContractAmount}</span></div>
              </div>
            </div>
          ))}
          {fields.length === 0 && <p className="text-slate-500">No fields found.</p>}
        </div>
      </div>
    </div>
  );
}
