import { LayoutGrid, ClipboardList, Plus, Users, Sprout, Truck, BarChart3, MoreHorizontal } from 'lucide-react';

interface MobileTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickAction: () => void;
  pendingCount?: number;
}

export default function MobileTabBar({
  activeTab,
  setActiveTab,
  onOpenQuickAction,
  pendingCount = 0
}: MobileTabBarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutGrid },
    { id: 'daily-work', label: 'Work Log', icon: ClipboardList },
    { id: 'harvests', label: 'Harvest', icon: Sprout },
    { id: 'workers', label: 'Workers', icon: Users },
    { id: 'more', label: 'More', icon: MoreHorizontal }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090B]/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 pt-2 pb-safe max-w-md mx-auto">
      <div className="relative flex items-center justify-around">
        {/* First 2 tabs */}
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-1">{tab.label}</span>
            </button>
          );
        })}

        {/* Central Floating Quick Action (+) Button */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={onOpenQuickAction}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 active:scale-90 transition-transform ring-4 ring-[#09090B]"
            aria-label="Quick Action"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
          <span className="text-[9px] font-semibold text-indigo-300 mt-1 uppercase tracking-wider">Log</span>
        </div>

        {/* Last 2 tabs */}
        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'more' && ['owners', 'vehicles', 'reports'].includes(activeTab));
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
