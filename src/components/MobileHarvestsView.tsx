import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Sprout, Plus, CheckCircle2, TrendingUp, Sparkles, ChevronRight, X, Truck, Calendar } from 'lucide-react';

export default function MobileHarvestsView() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: harvests = [] } = useQuery({
    queryKey: ['harvests'],
    queryFn: () => api.get('/harvests').then((res) => res.data)
  });

  const { data: fields = [] } = useQuery({
    queryKey: ['fields'],
    queryFn: () => api.get('/fields').then((res) => res.data)
  });

  const [formData, setFormData] = useState({
    fieldId: '',
    harvestDate: new Date().toISOString().split('T')[0],
    totalCoconuts: 3500,
    matureCount: 3000,
    tenderCount: 500,
    grade: 'Grade A',
    batchRevenue: 87500,
    notes: ''
  });

  const saveHarvest = useMutation({
    mutationFn: (data: any) => api.post('/harvests', data),
    onSuccess: () => {
      qc.invalidateQueries();
      setShowModal(false);
    }
  });

  const handleTotalChange = (total: number) => {
    const mature = Math.round(total * 0.85);
    const tender = total - mature;
    const rate = formData.grade === 'Grade A' ? 25 : formData.grade === 'Grade B' ? 20 : 15;
    setFormData({
      ...formData,
      totalCoconuts: total,
      matureCount: mature,
      tenderCount: tender,
      batchRevenue: total * rate
    });
  };

  const handleGradeChange = (grade: string) => {
    const rate = grade === 'Grade A' ? 25 : grade === 'Grade B' ? 20 : 15;
    setFormData({
      ...formData,
      grade,
      batchRevenue: formData.totalCoconuts * rate
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fieldId) return;
    saveHarvest.mutate(formData);
  };

  const totalNutsCollected = harvests.reduce((acc: number, h: any) => acc + (h.total_coconuts || 0), 0);
  const totalRevenueCollected = harvests.reduce((acc: number, h: any) => acc + (h.batch_revenue || 0), 0);

  return (
    <div className="space-y-4 pb-safe">
      {/* Harvest Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Sprout size={18} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Harvested</span>
          </div>
          <h3 className="text-2xl font-black text-slate-100">{totalNutsCollected.toLocaleString()}</h3>
          <span className="text-[10px] text-slate-400">Recorded batch nuts</span>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <TrendingUp size={18} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Est. Batch Value</span>
          </div>
          <h3 className="text-2xl font-black text-slate-100">₹{(totalRevenueCollected / 1000).toFixed(1)}k</h3>
          <span className="text-[10px] text-emerald-400">₹25 avg market rate</span>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100">Harvest Batches</h3>
          <p className="text-xs text-slate-400">Lots sorted by field blocks</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 rounded-2xl bg-indigo-600 active:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus size={15} strokeWidth={3} />
          <span>New Batch</span>
        </button>
      </div>

      {/* Batches List */}
      <div className="space-y-3">
        {harvests.map((h: any) => (
          <div
            key={h.id}
            className="glass-card p-4 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-100">{h.field_name || 'Block Grove'}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    h.grade === 'Grade A'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {h.grade}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{h.field_location || 'Main Sector'}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">{h.harvest_date}</span>
                <span className="block text-xs font-bold text-emerald-400 mt-0.5">
                  ₹{Number(h.batch_revenue || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Nut Breakdown Bar */}
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Yield</span>
                <p className="font-bold text-slate-200 text-sm">{Number(h.total_coconuts).toLocaleString()} nuts</p>
              </div>
              <div className="h-6 w-px bg-slate-800"></div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Mature Copra</span>
                <p className="font-bold text-amber-300">{Number(h.mature_count || 0).toLocaleString()}</p>
              </div>
              <div className="h-6 w-px bg-slate-800"></div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Tender Water</span>
                <p className="font-bold text-emerald-300">{Number(h.tender_count || 0).toLocaleString()}</p>
              </div>
            </div>

            {h.notes && (
              <p className="text-xs text-slate-400 italic bg-slate-950/30 p-2 rounded-xl">"{h.notes}"</p>
            )}
          </div>
        ))}

        {harvests.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-xs">
            <Sprout size={32} className="mx-auto mb-2 text-slate-600" />
            No harvest batches logged yet. Tap "New Batch" to begin.
          </div>
        )}
      </div>

      {/* Modal for Recording New Harvest */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">Record Harvest Batch</h3>
                <p className="text-xs text-slate-400">Log nuts collected from field block</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Select Field</label>
                <select
                  required
                  value={formData.fieldId}
                  onChange={(e) => setFormData({ ...formData, fieldId: e.target.value })}
                  className="coco-input text-xs"
                >
                  <option value="">Choose estate field...</option>
                  {fields.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.tree_count || f.treeCount} trees)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Harvest Date</label>
                <input
                  type="date"
                  required
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                  className="coco-input text-xs"
                />
              </div>

              {/* Total Nuts Stepper */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Total Nuts Harvested</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTotalChange(Math.max(100, formData.totalCoconuts - 250))}
                    className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-200 font-bold text-lg"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={formData.totalCoconuts}
                    onChange={(e) => handleTotalChange(Number(e.target.value))}
                    className="coco-input text-center font-bold text-base"
                  />
                  <button
                    type="button"
                    onClick={() => handleTotalChange(formData.totalCoconuts + 250)}
                    className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-200 font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Grade Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Quality Grade</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Grade A', 'Grade B', 'Grade C'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleGradeChange(g)}
                      className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                        formData.grade === g
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Est Revenue Display */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-semibold">Estimated Batch Revenue</span>
                <span className="text-emerald-400 font-bold text-sm">₹{formData.batchRevenue.toLocaleString()}</span>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Notes (e.g. Monsoon heavy load batch)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="coco-input text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={!formData.fieldId || saveHarvest.isPending}
                className="w-full coco-btn-primary"
              >
                {saveHarvest.isPending ? 'Saving Batch...' : 'Save Harvest Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
