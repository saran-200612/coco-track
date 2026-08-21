import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Users, Phone, Plus, CheckCircle2, XCircle, Clock, X, DollarSign, Sparkles } from 'lucide-react';

export default function MobileWorkersView() {
  const qc = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: workers = [] } = useQuery({
    queryKey: ['workers'],
    queryFn: () => api.get('/workers').then((res) => res.data)
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => api.get('/attendance').then((res) => res.data)
  });

  const [newWorker, setNewWorker] = useState({
    name: '',
    phone: '',
    workerType: 'CLIMBER',
    defaultDailyRate: 650,
    defaultClimbRatePerTree: 35
  });

  const markAttendance = useMutation({
    mutationFn: (data: { workerId: string; status: string; workDate: string }) => api.post('/attendance', data),
    onSuccess: () => qc.invalidateQueries()
  });

  const addWorker = useMutation({
    mutationFn: (data: any) => api.post('/workers', data),
    onSuccess: () => {
      qc.invalidateQueries();
      setShowAddModal(false);
      setNewWorker({
        name: '',
        phone: '',
        workerType: 'CLIMBER',
        defaultDailyRate: 650,
        defaultClimbRatePerTree: 35
      });
    }
  });

  // Map today's attendance status by worker_id
  const attendanceMap = new Map<string, string>();
  attendance
    .filter((a: any) => a.work_date === selectedDate)
    .forEach((a: any) => {
      attendanceMap.set(a.worker_id, a.status);
    });

  const presentCount = Array.from(attendanceMap.values()).filter((s) => s === 'PRESENT').length;

  return (
    <div className="space-y-4 pb-safe">
      {/* Attendance Summary Header */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Attendance Punch</span>
            <h3 className="text-lg font-bold text-slate-100">Daily Roll Call</h3>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-medium">{presentCount} Present Today</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
            <span className="text-slate-400">{workers.length - presentCount} Not Logged</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-bold text-slate-200">Worker Roster ({workers.length})</h4>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 active:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-indigo-600/20"
        >
          <Plus size={14} />
          <span>Add Worker</span>
        </button>
      </div>

      {/* Workers Cards with One-Touch Punch Buttons */}
      <div className="space-y-3">
        {workers.map((w: any) => {
          const currentStatus = attendanceMap.get(w.id);
          return (
            <div
              key={w.id}
              className="glass-card p-4 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-base">
                    {w.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{w.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-semibold uppercase">
                        {w.worker_type || w.workerType}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {w.worker_type === 'CLIMBER'
                          ? `₹${w.default_climb_rate_per_tree || 35}/tree`
                          : `₹${w.default_daily_rate || 650}/day`}
                      </span>
                    </div>
                  </div>
                </div>

                {w.phone && (
                  <a
                    href={`tel:${w.phone}`}
                    className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 active:bg-slate-700 transition-colors"
                  >
                    <Phone size={16} />
                  </a>
                )}
              </div>

              {/* Attendance Quick Toggle Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => markAttendance.mutate({ workerId: w.id, status: 'PRESENT', workDate: selectedDate })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    currentStatus === 'PRESENT'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400'
                      : 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>Present</span>
                </button>

                <button
                  onClick={() => markAttendance.mutate({ workerId: w.id, status: 'HALF_DAY', workDate: selectedDate })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    currentStatus === 'HALF_DAY'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                      : 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Clock size={13} />
                  <span>Half Day</span>
                </button>

                <button
                  onClick={() => markAttendance.mutate({ workerId: w.id, status: 'ABSENT', workDate: selectedDate })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    currentStatus === 'ABSENT'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-400'
                      : 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <XCircle size={13} />
                  <span>Absent</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">Add Field Worker</h3>
                <p className="text-xs text-slate-400">Register new climber or laborer</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addWorker.mutate(newWorker);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Gowda"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  className="coco-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newWorker.phone}
                  onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                  className="coco-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Worker Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {['CLIMBER', 'COLLECTOR', 'DRIVER'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setNewWorker({ ...newWorker, workerType: role })}
                      className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                        newWorker.workerType === role
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {newWorker.workerType === 'CLIMBER' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Climbing Rate (₹ per tree)</label>
                  <input
                    type="number"
                    value={newWorker.defaultClimbRatePerTree}
                    onChange={(e) => setNewWorker({ ...newWorker, defaultClimbRatePerTree: Number(e.target.value) })}
                    className="coco-input text-xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Daily Fixed Wage (₹ per day)</label>
                  <input
                    type="number"
                    value={newWorker.defaultDailyRate}
                    onChange={(e) => setNewWorker({ ...newWorker, defaultDailyRate: Number(e.target.value) })}
                    className="coco-input text-xs"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={!newWorker.name || addWorker.isPending}
                className="w-full coco-btn-primary"
              >
                {addWorker.isPending ? 'Registering...' : 'Add Worker'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
