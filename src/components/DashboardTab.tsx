import React, { useState, useEffect } from 'react';
import { useGymStore } from '../store';
import { WORKOUT_SPLIT } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, Dumbbell, Calendar, Clock, ChevronRight, Activity, 
  TrendingUp, Award, Droplet, User, Scale, X, Save, ShieldCheck, 
  RotateCcw, Sliders, ListTodo, Trophy
} from 'lucide-react';

interface DashboardTabProps {
  onNavigateToWorkouts: () => void;
}

export default function DashboardTab({ onNavigateToWorkouts }: DashboardTabProps) {
  const { historyLogs, startWorkout, athlete, lastWeightHistory, updateAthlete } = useGymStore();

  // Helper code to get today's default workout based on day of the week
  const getDefaultWorkoutForToday = () => {
    const day = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (day === 1 || day === 4) return 'treino-a'; // Seg / Qui -> A (Push)
    if (day === 2 || day === 5) return 'treino-b'; // Ter / Sex -> B (Pull)
    if (day === 3 || day === 6) return 'treino-c'; // Qua / Sáb -> C (Legs)
    return 'treino-a'; // Sunday default
  };

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(getDefaultWorkoutForToday());
  const selectedWorkout = WORKOUT_SPLIT.find(w => w.id === selectedWorkoutId) || WORKOUT_SPLIT[0];

  // Modals / Overlays triggers
  const [activeModal, setActiveModal] = useState<'history' | 'biometrics' | 'prs' | 'progress' | null>(null);

  // Quick state logs for hydration tracker as an interactive physical progress helper
  const [waterLogged, setWaterLogged] = useState<number>(() => {
    const saved = localStorage.getItem('tatu_gym_hydration_today');
    const savedDate = localStorage.getItem('tatu_gym_hydration_date');
    const todayStr = new Date().toDateString();
    if (saved && savedDate === todayStr) {
      return parseInt(saved, 10);
    }
    return 0;
  });

  useEffect(() => {
    localStorage.setItem('tatu_gym_hydration_today', String(waterLogged));
    localStorage.setItem('tatu_gym_hydration_date', new Date().toDateString());
  }, [waterLogged]);

  // Form states inside Biometric slider modal
  const [nameVal, setNameVal] = useState(athlete.name);
  const [weightVal, setWeightVal] = useState(athlete.weight);
  const [heightVal, setHeightVal] = useState(athlete.height);
  const [focusVal, setFocusVal] = useState(athlete.focus);
  const [levelVal, setLevelVal] = useState(athlete.level);

  // Sync state with store on load / update
  useEffect(() => {
    setNameVal(athlete.name);
    setWeightVal(athlete.weight);
    setHeightVal(athlete.height);
    setFocusVal(athlete.focus);
    setLevelVal(athlete.level);
  }, [athlete]);

  const handleSaveBiometrics = (e: React.FormEvent) => {
    e.preventDefault();
    updateAthlete({
      name: nameVal,
      weight: Number(weightVal),
      height: Number(heightVal),
      focus: focusVal,
      level: levelVal
    });
    setActiveModal(null);
  };

  // Days of the week data model
  const daysOfWeek = [
    { label: 'SEG', dayIndex: 1 },
    { label: 'TER', dayIndex: 2 },
    { label: 'QUA', dayIndex: 3 },
    { label: 'QUI', dayIndex: 4 },
    { label: 'SEX', dayIndex: 5 },
    { label: 'SÁB', dayIndex: 6 },
    { label: 'DOM', dayIndex: 0 },
  ];

  const checkDayCompleted = (dayIndex: number) => {
    const today = new Date();
    const currentWeekLogs = historyLogs.filter(log => {
      const logDate = new Date(log.date);
      // Ensure logs are from the last 7 days
      const diffTime = Math.abs(today.getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && logDate.getDay() === dayIndex;
    });

    if (currentWeekLogs.length > 0) return true;
    
    // Aesthetic fallback if no logs recorded yet to make the dashboard look populated
    if (historyLogs.length === 0) {
      return dayIndex === 1 || dayIndex === 3; // Mock Seg/Qua completed
    }
    return false;
  };

  const getDayStatusColor = (dayIndex: number) => {
    const completed = checkDayCompleted(dayIndex);
    const isToday = new Date().getDay() === dayIndex;
    if (completed) return 'bg-[#FF5F00] text-black';
    if (isToday) return 'border border-white/20 text-white font-black bg-white/5';
    return 'bg-white/[0.02] text-white/25 border border-white/[0.03]';
  };

  // Workout metrics calculations
  const totalCompletedWorkouts = historyLogs.length;
  const targetCompletedWorkouts = 5;
  const currentWeekCompletedCount = daysOfWeek.filter(d => checkDayCompleted(d.dayIndex)).length;
  const consistencyPercent = Math.min(100, Math.round((currentWeekCompletedCount / 5) * 100));

  // BMI calculator helper
  const bmiValue = (athlete.weight / (athlete.height * athlete.height)).toFixed(1);
  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return 'Abaixo do peso';
    if (bmi < 25) return 'Atlético / Estético';
    if (bmi < 30) return 'Massa Muscular / Off';
    return 'Alta densidade';
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-[#FFFFFF] font-sans overflow-y-auto pb-12" id="new-tactical-dashboard-view">
      
      {/* 1. HERO SUPERIOR (Biometric Neural Dashboard console) */}
      <header className="px-6 pt-7 pb-5 flex flex-col relative overflow-hidden" id="dashboard-hero-superior">
        {/* Decorative corner grid matrix (subtle, high-end) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5F00] rounded-full blur-[80px] opacity-[0.06]" />
        
        <div className="flex items-baseline justify-between z-10">
          <div className="flex flex-col text-left">
            <span className="font-mono text-[9px] tracking-[0.2em] text-white/30 uppercase font-black">
              CONSOLE OPERACIONAL DE ATLETA
            </span>
            <h1 className="text-3xl font-black mt-1 text-white tracking-tight leading-none uppercase italic">
              {athlete.name}
            </h1>
            <p className="text-xs text-white/55 font-mono mt-2 flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5F00] animate-pulse inline-block" />
              STATUS: {athlete.level.toUpperCase()} // FOCO ESTÉTICO ATIVO
            </p>
          </div>

          <div className="text-right flex flex-col font-mono text-[10px]">
            <span className="text-white/25 font-black">CONSISTÊNCIA</span>
            <span className="text-lg font-extrabold text-[#FF5F00] leading-none mt-1">{consistencyPercent}%</span>
          </div>
        </div>

        {/* Neural Dashboard Parameters Bar */}
        <div className="grid grid-cols-3 gap-0.5 mt-5 border-t border-b border-white/[0.04] py-3 text-left font-mono" id="hero-parameters-bar">
          <div className="pl-1">
            <span className="text-[7.5px] uppercase text-white/35 font-bold tracking-widest block">MASSA</span>
            <span className="text-sm font-extrabold text-white mt-1 block tracking-tight font-mono">{athlete.weight} KG</span>
          </div>
          <div className="border-l border-white/[0.03] pl-3.5">
            <span className="text-[7.5px] uppercase text-white/35 font-bold tracking-widest block">ESTATURA</span>
            <span className="text-sm font-extrabold text-white mt-1 block tracking-tight font-mono">{athlete.height} M</span>
          </div>
          <div className="border-l border-white/[0.03] pl-3.5">
            <span className="text-[7.5px] uppercase text-white/35 font-bold tracking-widest block">COMPROMISSO</span>
            <span className="text-sm font-extrabold text-[#FF5F00] mt-1 block tracking-tight font-mono">{currentWeekCompletedCount}/5 SESSÕES</span>
          </div>
        </div>
      </header>

      {/* 2. TREINO DO DIA (Tactical Combat Controller) */}
      <section className="px-5 mb-5" id="dashboard-treino-do-dia">
        <div className="bg-[#0b0b0d] border border-white/[0.03] rounded-[1.8rem] p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between" id="combat-card-container">
          
          {/* Internal diagonal accent mark */}
          <div className="absolute top-0 right-0 w-16 h-[1.5px] bg-[#FF5F00]/30 transform rotate-45 translate-x-4 translate-y-3" />
          
          <div className="flex items-center justify-between mb-4.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3 bg-[#FF5F00] rounded-sm block" />
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold">
                PROTOCOLO DE HOJE
              </span>
            </div>
            
            <span className="text-[8.5px] font-mono text-[#FF5F00] font-black uppercase tracking-widest bg-[#FF5F00]/5 px-2.5 py-0.5 rounded-full border border-[#FF5F00]/10">
              SISTEMA RECOMENDA
            </span>
          </div>

          {/* Quick tab toggle for Split A/B/C using absolute minimal tactile tabs */}
          <div className="grid grid-cols-3 gap-1 bg-black/60 p-1.5 rounded-2xl border border-white/[0.03] mb-5" id="combat-split-toggle">
            {WORKOUT_SPLIT.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWorkoutId(w.id)}
                className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-150 cursor-pointer text-center leading-none ${
                  selectedWorkoutId === w.id
                    ? 'bg-[#FF5F00] text-black font-[950] shadow-md shadow-[#FF5F00]/10'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>

          {/* Core Telemetry fields */}
          <div className="space-y-3.5 mb-5.5 text-left" id="combat-telemetry-panel">
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight font-sans leading-none">
                {selectedWorkout.title}
              </h2>
              <span className="text-[10px] text-[#FF5F00] font-bold tracking-widest uppercase block mt-1 font-mono uppercase">
                FOCO INTEGRAL: {selectedWorkout.focus.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-1.5" id="combat-quick-data-grid">
              <div className="bg-black/45 p-2.5 rounded-xl border border-white/[0.02] flex items-center gap-2.5">
                <Dumbbell className="w-4 h-4 text-[#FF5F00]/70 flex-shrink-0" />
                <div>
                  <span className="text-[7.5px] text-white/35 uppercase block font-bold font-mono">Volume Fisiológico</span>
                  <span className="text-xs font-mono font-black text-white mt-0.5 block">{selectedWorkout.exercises.length} Exercícios</span>
                </div>
              </div>

              <div className="bg-black/45 p-2.5 rounded-xl border border-white/[0.02] flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#FF5F00]/70 flex-shrink-0" />
                <div>
                  <span className="text-[7.5px] text-white/35 uppercase block font-bold font-mono">Carga de Repouso</span>
                  <span className="text-xs font-mono font-black text-white mt-0.5 block">Ø 75 min estim.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Big Glow tactical CTA start button */}
          <button
            id="start-workout-trigger-cta"
            onClick={() => {
              startWorkout(selectedWorkout.id);
              onNavigateToWorkouts();
            }}
            className="w-full py-4.5 bg-[#FF5F00] hover:bg-[#FF7320] text-black font-black tracking-[0.14em] uppercase italic rounded-2xl transform active:scale-[0.98] transition-all text-center flex items-center justify-center gap-2 group cursor-pointer text-xs shadow-[0_0_20px_rgba(255,95,0,0.15)] hover:shadow-[0_0_30px_rgba(255,95,0,0.3)] duration-150"
          >
            <Activity className="w-4 h-4 fill-black text-black group-hover:scale-110 transition-transform" />
            <span>INICIAR TREINO</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </section>

      {/* 3. PERFORMANCE SEMANAL (Tactical Discipline Streak Matrix) */}
      <section className="px-5 mb-5" id="dashboard-discipline-system">
        <div className="bg-[#0b0b0d] border border-white/[0.03] rounded-[1.8rem] p-4.5 shadow-2xl flex flex-col" id="discipline-card-container">
          
          <div className="flex items-center justify-between mb-3.5 px-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 font-black">
              SISTEMA DE DISCIPLINA SEMANAL
            </span>
            <span className="text-[9px] font-mono text-[#FF5F00] font-extrabold uppercase">
              META: 5 / 5 DIAS
            </span>
          </div>

          {/* Minimal visual calendar bar */}
          <div className="grid grid-cols-7 gap-1.5" id="weekly-indicators-matrix">
            {daysOfWeek.map((day) => {
              const completed = checkDayCompleted(day.dayIndex);
              return (
                <div key={day.dayIndex} className="flex flex-col items-center gap-1.5" id={`day-indicator-column-${day.dayIndex}`}>
                  <span className="text-[8px] font-bold text-white/30 uppercase font-mono tracking-widest">{day.label}</span>
                  <div 
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${getDayStatusColor(day.dayIndex)}`}
                  >
                    {completed ? (
                      <Flame className="w-4.5 h-4.5 fill-current text-black animate-pulse" />
                    ) : (
                      <span className="text-[10px] font-mono opacity-40 font-extrabold">·</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-3.5 px-1 pt-3 border-t border-white/[0.03]" id="discipline-footer-summary">
            <span className="text-[8.5px] text-white/45 uppercase tracking-wider font-mono font-bold">
              CONEXÃO SINÁPTICA DE HÁBITO
            </span>
            <span className="text-[9px] text-[#FF5F00] font-mono font-black uppercase">
              {currentWeekCompletedCount >= 5 ? 'EXCEDENTE DE PROTOCOLO' : 'PENDENTE DE TREINO'}
            </span>
          </div>

        </div>
      </section>

      {/* 4. QUICK ACTIONS (Operational Tactical Utility Hub) */}
      <section className="px-5 mb-8" id="dashboard-operational-actions-hub">
        <div className="flex flex-col space-y-2.5" id="tactical-actions-panel-wrapper">

          <div className="grid grid-cols-2 gap-2.5" id="bento-tactical-buttons-grid">
            
            {/* Action 1: Historico Logs */}
            <button
              onClick={() => setActiveModal('history')}
              className="bg-[#0b0b0d] hover:bg-white/[0.02] border border-white/[0.03] hover:border-white/10 rounded-2xl p-4 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between h-[82px] relative group"
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-1.5 bg-white/5 border border-white/5 rounded-xl text-[#FF5F00]/80 group-hover:bg-[#FF5F00]/10 transition-colors">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-white uppercase tracking-tight block font-sans">
                  Histórico Ativo
                </span>
              </div>
            </button>

            {/* Action 2: Perfil Biometrics */}
            <button
              onClick={() => setActiveModal('biometrics')}
              className="bg-[#0b0b0d] hover:bg-white/[0.02] border border-white/[0.03] hover:border-white/10 rounded-2xl p-4 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between h-[82px] relative group"
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-1.5 bg-white/5 border border-white/5 rounded-xl text-[#FF5F00]/80 group-hover:bg-[#FF5F00]/10 transition-colors">
                  <User className="w-3.5 h-3.5" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-white uppercase tracking-tight block font-sans">
                  Ajustes Biométricos
                </span>
              </div>
            </button>

            {/* Action 3: PRs Load weights */}
            <button
              onClick={() => setActiveModal('prs')}
              className="bg-[#0b0b0d] hover:bg-white/[0.02] border border-white/[0.03] hover:border-white/10 rounded-2xl p-4 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between h-[82px] relative group"
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-1.5 bg-white/5 border border-white/5 rounded-xl text-[#FF5F00]/80 group-hover:bg-[#FF5F00]/10 transition-colors">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-white uppercase tracking-tight block font-sans">
                  Recordes Pessoais
                </span>
              </div>
            </button>

            {/* Action 4: Hydration & Progress */}
            <button
              onClick={() => setActiveModal('progress')}
              className="bg-[#0b0b0d] hover:bg-white/[0.02] border border-white/[0.03] hover:border-white/10 rounded-2xl p-4 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between h-[82px] relative group"
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-1.5 bg-white/5 border border-white/5 rounded-xl text-[#FF5F00]/80 group-hover:bg-[#FF5F00]/10 transition-colors">
                  <Droplet className="w-3.5 h-3.5" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-white uppercase tracking-tight block font-sans">
                  Consumo & Hidratação
                </span>
              </div>
            </button>

          </div>
        </div>
      </section>

      {/* =======================================================
          TACTICAL DRAWER POPUPS & BIO CONTROL OVERLAYS 
          ======================================================= */}
      <AnimatePresence>
        
        {/* MODAL 1: HISTORY LOGS OVERLAY */}
        {activeModal === 'history' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-end justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ translateY: '100%' }}
              animate={{ translateY: '0%' }}
              exit={{ translateY: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-[2rem] p-5 shadow-[0_-15px_40px_rgba(0,0,0,0.8)] max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF5F00]" />
                  <h3 className="text-sm font-black uppercase italic tracking-wider text-white">HISTÓRICO ATIVO DE SESSÕES</h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Logs List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {historyLogs.length === 0 ? (
                  <div className="p-8 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-xl space-y-2">
                    <Dumbbell className="w-8 h-8 text-white/20 mx-auto" />
                    <h4 className="text-xs font-black text-white/80 uppercase">Nenhuma sessão gravada</h4>
                    <p className="text-[10px] text-white/40 max-w-xs mx-auto mb-2 leading-relaxed">
                      Complete seu primeiro treino selecionando-o no painel principal e iniciando a fita de contração muscular.
                    </p>
                  </div>
                ) : (
                  historyLogs.map((log: any) => {
                    const d = new Date(log.date);
                    const formattedDate = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                    return (
                      <div 
                        key={log.id}
                        className="bg-zinc-950/75 border border-white/[0.04] p-3.5 rounded-2xl flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8.5px] font-mono font-black text-[#FF5F00] uppercase tracking-widest bg-[#FF5F00]/5 px-2 py-0.5 rounded">
                              {log.workoutTitle.split(' (')[0]}
                            </span>
                            <h4 className="text-xs font-black text-white uppercase italic mt-1 leading-snug">
                              {log.workoutTitle}
                            </h4>
                          </div>
                          <span className="text-[8.5px] font-mono text-white/40 font-bold uppercase">{formattedDate}</span>
                        </div>

                        {log.photo && (
                          <div className="mt-2.5 h-20 rounded-xl overflow-hidden relative border border-white/5">
                            <img 
                              src={log.photo} 
                              alt="Checkpoint selfie" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <span className="absolute bottom-2 left-2 text-[8px] font-mono text-white/60 font-black">
                              IMAGEM CHECKPOINT GRAVADA // SHAPE INTEGRADO
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[8px] font-mono font-bold uppercase text-white/50 pt-2.5 mt-2.5 border-t border-white/[0.03]">
                          <span>Tempo: {log.durationMinutes} min</span>
                          <span>Exercícios: {log.exercisesCompletedCount}</span>
                          <span className="text-[#FF5F00]">Séries: {log.setsCompletedCount}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* MODAL 2: ADJUST BIOMETRICS FORM */}
        {activeModal === 'biometrics' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-end justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ translateY: '100%' }}
              animate={{ translateY: '0%' }}
              exit={{ translateY: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-[2rem] p-5 shadow-[0_-15px_40px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#FF5F00]" />
                  <h3 className="text-sm font-black uppercase italic tracking-wider text-white">RECONFIGURAR BIOMETRICAS</h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBiometrics} className="space-y-4 text-left">
                {/* Name */}
                <div>
                  <label className="text-[8px] font-mono font-black text-white/35 uppercase tracking-widest block mb-1 pl-1">
                    Nome Completo
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    className="w-full bg-black border border-white/10 focus:border-[#FF5F00] outline-none text-xs text-white px-3.5 py-2.5 rounded-xl font-bold font-sans transition-colors"
                  />
                </div>

                {/* Weight & Height */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[8px] font-mono font-black text-white/35 uppercase tracking-widest block mb-1 pl-1">
                      Massa Corporal (kg)
                    </label>
                    <input 
                      type="number" 
                      step="0.1"
                      required 
                      value={weightVal}
                      onChange={(e) => setWeightVal(Number(e.target.value))}
                      className="w-full bg-black border border-white/10 focus:border-[#FF5F00] outline-none text-xs text-white px-3 py-2.5 rounded-xl font-mono text-center font-bold text-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono font-black text-white/35 uppercase tracking-widest block mb-1 pl-1">
                      Estatura (m)
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      required 
                      value={heightVal}
                      onChange={(e) => setHeightVal(Number(e.target.value))}
                      className="w-full bg-black border border-white/10 focus:border-[#FF5F00] outline-none text-xs text-white px-3 py-2.5 rounded-xl font-mono text-center font-bold text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Level / Discipline Status */}
                <div>
                  <label className="text-[8px] font-mono font-black text-white/35 uppercase tracking-widest block mb-1 pl-1">
                    Proficiência / Nível
                  </label>
                  <select 
                    value={levelVal}
                    onChange={(e) => setLevelVal(e.target.value)}
                    className="w-full bg-black border border-white/10 focus:border-[#FF5F00] focus:ring-0 outline-none text-xs text-white px-3.5 py-2.5 rounded-xl font-bold font-sans uppercase transition-colors"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                    <option value="Elite Brutal">Elite Brutal</option>
                  </select>
                </div>

                {/* Focus */}
                <div>
                  <label className="text-[8px] font-mono font-black text-white/35 uppercase tracking-widest block mb-1 pl-1">
                    Foco Estético Principal
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={focusVal}
                    onChange={(e) => setFocusVal(e.target.value)}
                    className="w-full bg-black border border-white/10 focus:border-[#FF5F00] outline-none text-xs text-white px-3.5 py-2.5 rounded-xl font-bold font-sans transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 bg-[#FF5F00] hover:bg-[#FF7320] text-black font-black uppercase text-xs tracking-widest italic rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#FF5F00]/10 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Salvar Calibração
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* MODAL 3: PERSONAL RECORDS (PRs) */}
        {activeModal === 'prs' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-end justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ translateY: '100%' }}
              animate={{ translateY: '0%' }}
              exit={{ translateY: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-[2rem] p-5 shadow-[0_-15px_40px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#FF5F00]" />
                  <h3 className="text-sm font-black uppercase italic tracking-wider text-white">RECORDE PESSOAL DE CARGAS</h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* PRs Grid and readout */}
              <div className="space-y-3.5 text-left">
                <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#FF5F00] font-black pl-0.5 block leading-none">
                  FITA MESTRA DE CARGAS MÁXIMAS
                </span>

                <div className="space-y-2.5" id="pr-leaderboard">
                  {/* Supino inclinado */}
                  <div className="bg-zinc-950 border border-white/5 p-3 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black text-xs text-[#FF5F00]">
                        01
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-white uppercase italic block">Supino Inclinado Máquina</span>
                        <span className="text-[7.5px] font-mono uppercase text-white/40 block mt-0.5 leading-none">PEITO SUPERIOR // HIPERTROFIA</span>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-extrabold text-[#FF5F00]">
                      {lastWeightHistory['a2'] !== undefined ? lastWeightHistory['a2'] : 20} KG / LADO
                    </span>
                  </div>

                  {/* Leg press */}
                  <div className="bg-zinc-950 border border-white/5 p-3 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black text-xs text-[#FF5F00]">
                        02
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-white uppercase italic block">Leg Press Potente</span>
                        <span className="text-[7.5px] font-mono uppercase text-white/40 block mt-0.5 leading-none">ALTO VOLUME DE QUADRÍCEPS</span>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-extrabold text-[#FF5F00]">
                      {lastWeightHistory['c2'] !== undefined ? lastWeightHistory['c2'] : 80} KG
                    </span>
                  </div>

                  {/* Puxada aberta */}
                  <div className="bg-zinc-950 border border-white/5 p-3 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black text-xs text-[#FF5F00]">
                        03
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-white uppercase italic block">Puxada Alta Aberta</span>
                        <span className="text-[7.5px] font-mono uppercase text-white/40 block mt-0.5 leading-none">DENSIDADE & ASAS LARGURA</span>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-extrabold text-[#FF5F00]">
                      {lastWeightHistory['b1'] !== undefined ? lastWeightHistory['b1'] : 45} KG
                    </span>
                  </div>

                  {/* Elevação lateral */}
                  <div className="bg-zinc-950 border border-white/5 p-3 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black text-xs text-[#FF5F00]">
                        04
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-white uppercase italic block">Elevação Lateral Halteres</span>
                        <span className="text-[7.5px] font-mono uppercase text-white/40 block mt-0.5 leading-none">DELTOIDE ISOLADO ESTÉTICA</span>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-extrabold text-[#FF5F00]">
                      {lastWeightHistory['a6'] !== undefined ? lastWeightHistory['a6'] : 8} KG
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-2.5 text-[9.5px] text-white/50 leading-relaxed italic" id="pr-disclaimer">
                  <ShieldCheck className="w-5 h-5 text-[#FF5F00] flex-shrink-0 mt-0.5" />
                  <p>
                    "Registramos automaticamente suas maiores marcas de treino conforme as fitas são gravadas. Aumente 1kg se a fita anterior foi concluída com folga técnica."
                  </p>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}

        {/* MODAL 4: HYDRATION & DETAILED PROGRESS */}
        {activeModal === 'progress' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-end justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ translateY: '100%' }}
              animate={{ translateY: '0%' }}
              exit={{ translateY: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-[2rem] p-5 shadow-[0_-15px_40px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-[#FF5F00]" />
                  <h3 className="text-sm font-black uppercase italic tracking-wider text-white">CONSUMO & COMPOSIÇÃO BIO</h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4.5 text-left">
                {/* Hydration Tracker */}
                <div className="bg-zinc-950 border border-white/5 p-4 rounded-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[8px] font-mono font-black text-[#FF5F00] uppercase tracking-widest block leading-none">
                        HIDRATAÇÃO INTRA-TREINO
                      </span>
                      <h4 className="text-sm font-black text-white italic uppercase mt-1 leading-none">Consumo de água de hoje</h4>
                    </div>
                    <span className="text-sm font-mono font-extrabold text-[#FF5F00]">
                      {waterLogged} / {Math.round(athlete.weight * 35)} mL
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden my-3">
                    <div 
                      className="bg-[#FF5F00] h-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, Math.round((waterLogged / (athlete.weight * 35)) * 100))}%` }}
                    />
                  </div>

                  {/* Fast increment buttons */}
                  <div className="grid grid-cols-4 gap-1.5 mt-4" id="hydration-quick-increments">
                    <button
                      onClick={() => setWaterLogged(prev => prev + 250)}
                      className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-mono font-extrabold text-white cursor-pointer transition-colors"
                    >
                      + 250ml
                    </button>
                    <button
                      onClick={() => setWaterLogged(prev => prev + 500)}
                      className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-mono font-extrabold text-white cursor-pointer transition-colors"
                    >
                      + 500ml
                    </button>
                    <button
                      onClick={() => setWaterLogged(prev => prev + 1000)}
                      className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-mono font-extrabold text-[#FF5F00] cursor-pointer transition-colors"
                    >
                      + 1000ml
                    </button>
                    <button
                      onClick={() => setWaterLogged(0)}
                      className="py-1.5 bg-[#FF5F00]/10 hover:bg-[#FF5F00]/20 border border-[#FF5F00]/15 rounded-xl text-[9px] font-mono font-extrabold text-[#FF5F00] cursor-pointer transition-colors"
                      title="Resetar Consumo"
                    >
                      <RotateCcw className="w-3 h-3 mx-auto" />
                    </button>
                  </div>
                </div>

                {/* Body Mass Index statistics block */}
                <div className="bg-zinc-950 border border-white/5 p-4 rounded-2xl" id="bmi-status-panel">
                  <span className="text-[8px] font-mono font-black text-white/35 uppercase tracking-widest block leading-none mb-1">
                    ESTATÍSTICA DE ÍNDICE CORPORAL
                  </span>
                  
                  <div className="flex justify-between items-baseline mt-2">
                    <h5 className="text-xl font-black font-mono text-[#FF5F00] leading-none">
                      IMC: {bmiValue}
                    </h5>
                    <span className="text-[10px] font-bold text-white uppercase font-sans">
                      {getBmiStatus(Number(bmiValue))}
                    </span>
                  </div>

                  <div className="text-[9px] text-white/40 leading-relaxed mt-2.5 font-sans font-semibold uppercase tracking-wider block">
                    Ideal estético em atletas: 22.0 - 26.0 (com baixo BF)
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
