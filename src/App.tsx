import React, { useState, useEffect, useRef } from 'react';
import { useGymStore } from './store';
import DashboardTab from './components/DashboardTab';
import WorkoutsTab from './components/WorkoutsTab';
import ProfileTab from './components/ProfileTab';
import { LayoutDashboard, Dumbbell, User } from 'lucide-react';

export default function App() {
  const { isActive, loadFromStorage, saveActiveSession } = useGymStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workouts' | 'profile'>('dashboard');

  // Load state on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Listener for 'visibilitychange' to trigger real-time auto-persistence
  useEffect(() => {
    const handleVisibilityChange = () => {
      saveActiveSession();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveActiveSession]);

  // Trigger auto navigation to training screen when a workout starts
  const prevIsActive = useRef(isActive);
  useEffect(() => {
    if (isActive && !prevIsActive.current) {
      setActiveTab('workouts');
    }
    prevIsActive.current = isActive;
  }, [isActive]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab onNavigateToWorkouts={() => setActiveTab('workouts')} />;
      case 'workouts':
        return <WorkoutsTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <DashboardTab onNavigateToWorkouts={() => setActiveTab('workouts')} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] flex justify-center selection:bg-[#FF5F00]/30 selection:text-white" id="tatu-gym-mobile-shell">
      {/* Restrict width to layout like a smartphone frame */}
      <div className="w-full max-w-md bg-black min-h-screen flex flex-col relative pb-16 border-x border-white/5 shadow-2xl" id="phone-container">
        
        {/* Active Content */}
        <main className="flex-1 overflow-hidden" id="tab-content-container">
          {renderActiveTab()}
        </main>

        {/* Dynamic Tatu Gym Bottom Navigation bar with exactly three tabs: Dashboard, Treinos, Perfil */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0c0c0c]/95 backdrop-blur-md border-t border-white/10 p-2.5 grid grid-cols-3 gap-1 z-30 shadow-2xl rounded-t-2xl" id="bottom-navigation-bar">
          
          {/* Dashboard TabButton */}
          <button
            id="nav-btn-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all uppercase tracking-wider ${
              activeTab === 'dashboard'
                ? 'text-[#FF5F00] font-black'
                : 'text-white/40 font-bold hover:text-white/60'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 transition-transform ${activeTab === 'dashboard' ? 'scale-110 text-[#FF5F00]' : ''}`} />
            <span className="text-[9px] mt-1.5 font-bold tracking-widest">Dashboard</span>
          </button>

          {/* Treinos TabButton */}
          <button
            id="nav-btn-workouts"
            onClick={() => setActiveTab('workouts')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative uppercase tracking-wider ${
              activeTab === 'workouts'
                ? 'text-[#FF5F00] font-black'
                : 'text-white/40 font-bold hover:text-white/60'
            }`}
          >
            {/* Active session ping */}
            {isActive && (
              <span className="absolute top-1.5 right-1/4 flex h-2 w-2" id="nav-active-ping">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5F00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5F00]"></span>
              </span>
            )}
            <Dumbbell className={`w-5 h-5 transition-transform ${activeTab === 'workouts' ? 'scale-110 text-[#FF5F00]' : ''}`} />
            <span className="text-[9px] mt-1.5 font-bold tracking-widest">Treinos</span>
          </button>

          {/* Perfil TabButton */}
          <button
            id="nav-btn-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all uppercase tracking-wider ${
              activeTab === 'profile'
                ? 'text-[#FF5F00] font-black'
                : 'text-white/40 font-bold hover:text-white/60'
            }`}
          >
            <User className={`w-5 h-5 transition-transform ${activeTab === 'profile' ? 'scale-110 text-[#FF5F00]' : ''}`} />
            <span className="text-[9px] mt-1.5 font-bold tracking-widest">Perfil</span>
          </button>

        </nav>
      </div>
    </div>
  );
}
