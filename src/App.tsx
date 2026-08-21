import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { synchronizeOfflineMutations } from './offline/syncEngine';
import MobileHeader from './components/MobileHeader';
import MobileTabBar from './components/MobileTabBar';
import QuickActionSheet from './components/QuickActionSheet';
import SyncStatusSheet from './components/SyncStatusSheet';
import MobileDashboard from './components/MobileDashboard';
import MobileDailyWorkLog from './components/MobileDailyWorkLog';
import MobileHarvestsView from './components/MobileHarvestsView';
import MobileWorkersView from './components/MobileWorkersView';
import MobileMoreView from './components/MobileMoreView';
import { Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 300000, retry: 1 } } });

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedEstate, setSelectedEstate] = useState('Green Grove Estate');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isSyncSheetOpen, setIsSyncSheetOpen] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  useEffect(() => {
    const handleOnline = () => { 
      setIsOnline(true); 
      synchronizeOfflineMutations(queryClient); 
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isCleanedUp = false;

    const connectWs = () => {
      if (isCleanedUp) return;
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        ws.onmessage = () => queryClient.invalidateQueries();
        ws.onerror = (err) => {
          console.warn('WebSocket connection error (will retry)', err);
        };
        ws.onclose = () => {
          if (!isCleanedUp) {
            reconnectTimeout = setTimeout(connectWs, 3000);
          }
        };
      } catch (err) {
        console.warn('WebSocket init error', err);
      }
    };
    connectWs();
    
    return () => {
      isCleanedUp = true;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[#060608] text-slate-50 flex flex-col items-center justify-start p-0 sm:py-4">
        
        {/* Desktop Viewport Switcher Banner (Visible only on desktop screens) */}
        <div className="hidden sm:flex items-center gap-3 mb-3 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 backdrop-blur-md shadow-lg">
          <span className="font-semibold text-slate-400">Mobile Application View</span>
          <div className="h-3.5 w-px bg-slate-700"></div>
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
              isPhoneFrame ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone size={13} />
            <span>Phone Frame</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
              !isPhoneFrame ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor size={13} />
            <span>Full Width</span>
          </button>
          <div className="h-3.5 w-px bg-slate-700"></div>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[11px] ${
              isOnline ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
            }`}
            title="Toggle simulated offline state for field testing"
          >
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{isOnline ? 'Online Test' : 'Offline Test'}</span>
          </button>
        </div>

        {/* Mobile Device Container */}
        <div
          className={`w-full relative flex flex-col transition-all ${
            isPhoneFrame
              ? 'sm:max-w-[430px] sm:h-[900px] sm:max-h-[95vh] sm:rounded-[48px] sm:border-[8px] sm:border-slate-800 sm:shadow-2xl sm:shadow-indigo-950/40 sm:overflow-hidden bg-[#09090B]'
              : 'max-w-md bg-[#09090B] min-h-screen'
          }`}
        >
          {/* Mobile Notch / Dynamic Island on Phone Frame */}
          {isPhoneFrame && (
            <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-50 pointer-events-none ring-1 ring-slate-800">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
            </div>
          )}

          {/* Mobile Header Bar */}
          <MobileHeader
            isOnline={isOnline}
            onOpenSync={() => setIsSyncSheetOpen(true)}
            onOpenQuickAction={() => setIsQuickActionOpen(true)}
            selectedEstate={selectedEstate}
            setSelectedEstate={setSelectedEstate}
          />

          {/* Main Mobile App Scrollable Viewport */}
          <main className="flex-1 overflow-y-auto px-4 pt-3 pb-24 no-scrollbar">
            {activeTab === 'dashboard' && (
              <MobileDashboard
                onNavigateTab={setActiveTab}
                onOpenQuickAction={() => setIsQuickActionOpen(true)}
              />
            )}
            {activeTab === 'daily-work' && <MobileDailyWorkLog />}
            {activeTab === 'harvests' && <MobileHarvestsView />}
            {activeTab === 'workers' && <MobileWorkersView />}
            {(activeTab === 'more' || ['owners', 'vehicles', 'reports'].includes(activeTab)) && (
              <MobileMoreView />
            )}
          </main>

          {/* Bottom Mobile Tab Navigation Bar */}
          <MobileTabBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenQuickAction={() => setIsQuickActionOpen(true)}
          />

          {/* Slide-Up Quick Action Drawer */}
          <QuickActionSheet
            isOpen={isQuickActionOpen}
            onClose={() => setIsQuickActionOpen(false)}
            onSelectAction={(tab) => {
              setActiveTab(tab);
              setIsQuickActionOpen(false);
            }}
          />

          {/* Offline Sync Diagnostics Sheet */}
          <SyncStatusSheet
            isOpen={isSyncSheetOpen}
            onClose={() => setIsSyncSheetOpen(false)}
            isOnline={isOnline}
          />
        </div>
      </div>
    </QueryClientProvider>
  );
}
