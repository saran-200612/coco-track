import { X, Trees, ClipboardCheck, Sprout, Truck, Users, PlusCircle, ArrowRight } from 'lucide-react';

interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
}

export default function QuickActionSheet({
  isOpen,
  onClose,
  onSelectAction
}: QuickActionSheetProps) {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'log-work',
      title: 'Log Daily Work',
      desc: 'Record climbing, de-husking, weeding & hours',
      icon: Trees,
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      tab: 'daily-work'
    },
    {
      id: 'mark-attendance',
      title: 'Mark Attendance',
      desc: 'Punch present/absent for on-field crew',
      icon: ClipboardCheck,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      tab: 'workers'
    },
    {
      id: 'record-harvest',
      title: 'Record Harvest Batch',
      desc: 'Log mature & tender nut counts by field',
      icon: Sprout,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      tab: 'harvests'
    },
    {
      id: 'log-vehicle',
      title: 'Log Vehicle Trip',
      desc: 'Tractor / truck transit & diesel expense',
      icon: Truck,
      color: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      tab: 'vehicles'
    },
    {
      id: 'add-field',
      title: 'Add Field / Owner',
      desc: 'Register new coconut grove or contract',
      icon: Users,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      tab: 'owners'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-md bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        {/* Drag Handle indicator */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4"></div>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Quick Field Action</h3>
            <p className="text-xs text-slate-400">Select an entry to log for today</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onSelectAction(act.tab);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 active:scale-[0.98] transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${act.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {act.title}
                    </h4>
                    <p className="text-xs text-slate-400">{act.desc}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
