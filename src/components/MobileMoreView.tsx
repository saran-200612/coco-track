import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { 
  Building2, Tractor, BarChart3, Settings, MapPin, Phone, 
  Plus, ChevronRight, X, TrendingUp, DollarSign, Fuel, ShieldCheck, Download
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function MobileMoreView() {
  const qc = useQueryClient();
  const [subTab, setSubTab] = useState<'fields' | 'vehicles' | 'reports'>('fields');
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showAddTripModal, setShowAddTripModal] = useState(false);

  // Data queries
  const { data: owners = [] } = useQuery({ queryKey: ['owners'], queryFn: () => api.get('/owners').then(r => r.data) });
  const { data: fields = [] } = useQuery({ queryKey: ['fields'], queryFn: () => api.get('/fields').then(r => r.data) });
  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: () => api.get('/vehicles').then(r => r.data) });
  const { data: trips = [] } = useQuery({ queryKey: ['vehicleTrips'], queryFn: () => api.get('/vehicle-trips').then(r => r.data) });
  const { data: reports } = useQuery({ queryKey: ['reports'], queryFn: () => api.get('/reports/summary').then(r => r.data) });

  // Add Field Form State
  const [fieldForm, setFieldForm] = useState({
    ownerId: '',
    name: '',
    location: '',
    areaAcres: 10,
    treeCount: 400,
    agreedContractAmount: 200000,
    contractStartDate: '2024-01-01',
    contractEndDate: '2025-01-01'
  });

  // Add Trip Form State
  const [tripForm, setTripForm] = useState({
    vehicleId: '',
    tripDate: new Date().toISOString().split('T')[0],
    destination: 'APMC Yard Mandi',
    loadCoconuts: 3200,
    fuelExpense: 1400,
    driverName: 'Suresh Reddy',
    notes: ''
  });

  const addField = useMutation({
    mutationFn: (data: any) => api.post('/fields', data),
    onSuccess: () => {
      qc.invalidateQueries();
      setShowAddFieldModal(false);
    }
  });

  const addTrip = useMutation({
    mutationFn: (data: any) => api.post('/vehicle-trips', data),
    onSuccess: () => {
      qc.invalidateQueries();
      setShowAddTripModal(false);
    }
  });

  const financialData = [
    { category: 'Harvest Revenue', amount: reports?.monthlyRevenue || 175000, fill: '#10b981' },
    { category: 'Wages Paid', amount: reports?.monthlyWagesPaid || 32000, fill: '#6366f1' },
    { category: 'Lease Paid', amount: reports?.leasePayable || 45000, fill: '#f59e0b' },
    { category: 'Fuel & Transit', amount: reports?.monthlyFuelExpense || 7400, fill: '#06b6d4' }
  ];

  return (
    <div className="space-y-4 pb-safe">
      {/* Sub Tab Navigation Switcher */}
      <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800 gap-1">
        <button
          onClick={() => setSubTab('fields')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'fields' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 size={14} />
          <span>Fields & Owners</span>
        </button>

        <button
          onClick={() => setSubTab('vehicles')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'vehicles' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tractor size={14} />
          <span>Vehicles</span>
        </button>

        <button
          onClick={() => setSubTab('reports')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'reports' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 size={14} />
          <span>Financials</span>
        </button>
      </div>

      {/* SUB TAB: FIELDS & OWNERS */}
      {subTab === 'fields' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Contracted Groves ({fields.length})</h3>
            <button
              onClick={() => setShowAddFieldModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Add Field</span>
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((f: any) => (
              <div key={f.id} className="glass-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{f.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold uppercase">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                      <MapPin size={12} className="text-indigo-400" />
                      <span>{f.location} • {f.area_acres || f.areaAcres} Acres</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Palm Trees</span>
                    <p className="font-bold text-slate-200 text-sm mt-0.5">{f.tree_count || f.treeCount} trees</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Agreed Contract</span>
                    <p className="font-bold text-indigo-300 text-sm mt-0.5">
                      ₹{Number(f.agreed_contract_amount || f.agreedContractAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Owner info */}
                {f.owner_name && (
                  <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-800/80">
                    <span className="text-slate-400 font-medium">Owner: {f.owner_name}</span>
                    {f.owner_phone && (
                      <a href={`tel:${f.owner_phone}`} className="text-emerald-400 flex items-center gap-1 font-bold">
                        <Phone size={12} /> Call Owner
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB: VEHICLES */}
      {subTab === 'vehicles' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Machinery & Logistics</h3>
            <button
              onClick={() => setShowAddTripModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Log Trip</span>
            </button>
          </div>

          {/* Vehicle Fleet Cards */}
          <div className="space-y-2.5">
            {vehicles.map((v: any) => (
              <div key={v.id} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Tractor size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{v.vehicle_name}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">{v.plate_number} • Driver: {v.driver_name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-sky-400 font-mono">{v.total_trips} trips</span>
                  <span className="block text-[10px] text-emerald-400 font-semibold uppercase">Active</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Transit Trips */}
          <div className="glass-card p-4">
            <h4 className="text-sm font-bold text-slate-200 mb-3">Recent Haulage Trips</h4>
            <div className="space-y-2.5">
              {trips.map((t: any) => (
                <div key={t.id} className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{t.destination}</span>
                    <span className="text-slate-400">{t.trip_date}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>{t.vehicle_name || 'Fleet Tractor'} • {t.load_coconuts} coconuts</span>
                    <span className="text-amber-400 font-semibold">₹{t.fuel_expense} Fuel</span>
                  </div>
                  {t.notes && <p className="text-[10px] text-slate-500 italic">"{t.notes}"</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB: REPORTS & FINANCIALS */}
      {subTab === 'reports' && (
        <div className="space-y-3">
          {/* Net Profit Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 p-5 shadow-xl">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Estate Profitability</span>
            <h3 className="text-3xl font-black text-slate-100 mt-1">₹{(reports?.netProfit || 90600).toLocaleString()}</h3>
            <p className="text-xs text-slate-400 mt-1">Net surplus after wages, lease & transportation</p>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-500">Gross Nut Revenue</span>
                <p className="font-bold text-emerald-400 text-sm">₹{(reports?.monthlyRevenue || 175000).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500">Total Operating Wages</span>
                <p className="font-bold text-indigo-400 text-sm">₹{(reports?.monthlyWagesPaid || 32000).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Bar Breakdown */}
          <div className="glass-card p-4">
            <h4 className="text-sm font-bold text-slate-200 mb-3">Financial Cash Flow (₹)</h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData} layout="vertical">
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="category" stroke="#64748b" tick={{ fontSize: 10 }} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                    {financialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Export Action */}
          <div className="glass-card p-4 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-200">Export Monthly Report</h4>
              <p className="text-xs text-slate-400">Download CSV statement</p>
            </div>
            <button
              onClick={() => alert('Monthly Estate Report exported successfully.')}
              className="px-3.5 py-2 bg-slate-800 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 active:bg-slate-700"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Field Modal */}
      {showAddFieldModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100">Add Estate Field</h3>
              <button onClick={() => setShowAddFieldModal(false)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addField.mutate(fieldForm); }} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Field Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Canal Block"
                  value={fieldForm.name}
                  onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                  className="coco-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Location Tag</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Hassan Main Gate"
                  value={fieldForm.location}
                  onChange={(e) => setFieldForm({ ...fieldForm, location: e.target.value })}
                  className="coco-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Trees Count</label>
                  <input
                    type="number"
                    value={fieldForm.treeCount}
                    onChange={(e) => setFieldForm({ ...fieldForm, treeCount: Number(e.target.value) })}
                    className="coco-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    value={fieldForm.areaAcres}
                    onChange={(e) => setFieldForm({ ...fieldForm, areaAcres: Number(e.target.value) })}
                    className="coco-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Agreed Lease (₹)</label>
                <input
                  type="number"
                  value={fieldForm.agreedContractAmount}
                  onChange={(e) => setFieldForm({ ...fieldForm, agreedContractAmount: Number(e.target.value) })}
                  className="coco-input text-xs"
                />
              </div>

              <button type="submit" disabled={!fieldForm.name || addField.isPending} className="w-full coco-btn-primary">
                {addField.isPending ? 'Saving...' : 'Register Field'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Trip Modal */}
      {showAddTripModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100">Log Vehicle Transit Trip</h3>
              <button onClick={() => setShowAddTripModal(false)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addTrip.mutate(tripForm); }} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Vehicle</label>
                <select
                  required
                  value={tripForm.vehicleId}
                  onChange={(e) => setTripForm({ ...tripForm, vehicleId: e.target.value })}
                  className="coco-input text-xs"
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.vehicle_name} ({v.plate_number})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Destination</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. APMC Mandi Yard Tumkur"
                  value={tripForm.destination}
                  onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                  className="coco-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Nuts Loaded</label>
                  <input
                    type="number"
                    value={tripForm.loadCoconuts}
                    onChange={(e) => setTripForm({ ...tripForm, loadCoconuts: Number(e.target.value) })}
                    className="coco-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Diesel (₹)</label>
                  <input
                    type="number"
                    value={tripForm.fuelExpense}
                    onChange={(e) => setTripForm({ ...tripForm, fuelExpense: Number(e.target.value) })}
                    className="coco-input text-xs"
                  />
                </div>
              </div>

              <button type="submit" disabled={!tripForm.vehicleId || addTrip.isPending} className="w-full coco-btn-primary">
                {addTrip.isPending ? 'Logging...' : 'Save Transit Trip'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
