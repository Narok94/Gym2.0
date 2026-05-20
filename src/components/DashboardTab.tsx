import React, { useState } from 'react';
import { useGymStore } from '../store';
import { WORKOUT_SPLIT } from '../data';
import { Dumbbell, Activity, Check, ChevronRight } from 'lucide-react';

interface DashboardTabProps {
  onNavigateToWorkouts: () => void;
}

export default function DashboardTab({ onNavigateToWorkouts }: DashboardTabProps) {
  const { historyLogs, startWorkout } = useGymStore();
  
  // Helper to determine active workout dynamically base on current day of the week
  const getDefaultWorkoutForToday = () => {
    const day = new Date().getDay(); // 0 = Dom, 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb
    if (day === 1 || day === 4) return 'treino-a'; // Segunda / Quinta -> A
    if (day === 2 || day === 5) return 'treino-b'; // Terça / Sexta -> B
    if (day === 3 || day === 6) return 'treino-c'; // Quarta / Sábado -> C
    return 'treino-a'; // Domingo default
  };

  // Dynamic pick for Recommended workout of the day (Defaults to today's workout)
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(getDefaultWorkoutForToday());
  const [activeSubgroupIdx, setActiveSubgroupIdx] = useState<number | null>(null);

  const handleWorkoutSelect = (id: string) => {
    setSelectedWorkoutId(id);
    setActiveSubgroupIdx(null);
  };

  const selectedWorkout = WORKOUT_SPLIT.find(w => w.id === selectedWorkoutId) || WORKOUT_SPLIT[0];

  // 7 weekdays list
  const daysOfWeek = [
    { label: 'S', dayIndex: 1, name: 'Seg' },
    { label: 'T', dayIndex: 2, name: 'Ter' },
    { label: 'Q', dayIndex: 3, name: 'Qua' },
    { label: 'Q', dayIndex: 4, name: 'Qui' },
    { label: 'S', dayIndex: 5, name: 'Sex' },
    { label: 'S', dayIndex: 6, name: 'Sáb' },
    { label: 'D', dayIndex: 0, name: 'Dom' },
  ];

  const isDayCompleted = (dayIndex: number) => {
    const hasLogs = historyLogs.some(log => {
      const logDate = new Date(log.date);
      return logDate.getDay() === dayIndex;
    });
    // Fallback block: If no logs recorded yet, pre-complete Wednesday (3) for mock/aesthetic visual representation
    if (historyLogs.length === 0) {
      return dayIndex === 3;
    }
    return hasLogs;
  };

  // Helper values to see if specific subgroup indexes are highlighted
  const isSgActive = (idx: number) => {
    return activeSubgroupIdx === null || activeSubgroupIdx === idx;
  };

  // Determine active target muscle groups for the anatomy graphic rendering
  const isChestActive = selectedWorkoutId === 'treino-a' && isSgActive(0);
  const isShoulderActive = selectedWorkoutId === 'treino-a' && isSgActive(1);
  const isArmsActive = (selectedWorkoutId === 'treino-a' && isSgActive(2)) || (selectedWorkoutId === 'treino-b' && isSgActive(2));
  
  const isBackActive = selectedWorkoutId === 'treino-b' && isSgActive(0);
  const isTrapActive = selectedWorkoutId === 'treino-b' && isSgActive(1);
  
  const isLegsActive = selectedWorkoutId === 'treino-c' && isSgActive(0);
  const isCalvesActive = selectedWorkoutId === 'treino-c' && isSgActive(1);
  const isCoreActive = selectedWorkoutId === 'treino-c' && isSgActive(2);

  // Return muscle target tags for current selected workout for Print 4 style layout columns
  const getSubgroupLabels = () => {
    switch (selectedWorkoutId) {
      case 'treino-b':
        return [
          { name: 'Costas Largas', active: true, label: 'DENSIDADE & ASAS' },
          { name: 'Trapézio Superior', active: true, label: 'FLEXÃO ESCAPULAR' },
          { name: 'Bíceps & Antebr.', active: true, label: 'VOLUME GERAL' }
        ];
      case 'treino-c':
        return [
          { name: 'Quadríceps Foco', active: true, label: 'PROJETADO ESTÉTICO' },
          { name: 'Panturrilha Foco', active: true, label: 'FEIXE DO SÓLEO' },
          { name: 'Core Profundo', active: true, label: 'VACUUM ATIVO' }
        ];
      case 'treino-a':
      default:
        return [
          { name: 'Peito Superior', active: true, label: 'PORÇÃO CLAVICULAR' },
          { name: 'Ombro Lateral', active: true, label: 'DELTOIDES ATIVOS' },
          { name: 'Tríceps Estético', active: true, label: 'CABEÇA LONGA' }
        ];
    }
  };

  const subgroups = getSubgroupLabels();

  // Inactive vs Active coloring configurations for boneco (Print 5)
  // Highly crisp and bright contrast - No fuzzy filters, precise strokes.
  const inactiveFill = '#1c1c24';
  const inactiveStroke = '#3a3a4a';
  
  const activeColor = '#FF5F00';
  const activeStrokeColor = '#FFFFFF';

  return (
    <div className="flex flex-col h-full bg-[#030305] text-[#F5F5F5] justify-between p-4 overflow-hidden" id="view-dashboard-tab">
      
      {/* 1. Slim Header (Optimized single-line for no-scroll viewport limits) */}
      <div className="flex items-center justify-between px-2 pt-1 pb-1 border-b border-white/[0.04]" id="dashboard-header-greet">
        <div className="flex flex-col text-left">
          <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-1">
            Olá, Henrique! <span className="text-sm select-none animate-bounce">👋</span>
          </h1>
          <span className="text-[7.5px] uppercase tracking-widest font-extrabold text-[#FF5F00] font-mono leading-none mt-0.5">
            ESTÉTICA & SIMETRIA AVANÇADA
          </span>
        </div>
        <div className="text-right">
          <span className="text-[7px] font-black text-white/30 uppercase tracking-wider block">CONTA</span>
          <span className="text-[8px] font-black text-white tracking-wider uppercase italic bg-zinc-900 border border-white/10 px-2 py-0.5 rounded ml-auto mt-0.5">
            AVANÇADO
          </span>
        </div>
      </div>

      {/* 2. CORE CARD CONTENT: Integrated selection and Print 4 layout with Print 5 body silhouette */}
      <div 
        className="bg-[#0b0b10] rounded-[2rem] border border-stone-850 p-4 shadow-xl relative overflow-hidden flex flex-col justify-between flex-1 my-3"
        id="recommended-workout-card"
      >
        {/* Subtle orange accent outline top */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF5F00] to-transparent"></div>

        {/* Dynamic workout split selector pills */}
        <div className="flex justify-between items-center bg-[#030305]/60 p-0.5 rounded-xl border border-stone-900/80 mb-2.5" id="dashboard-workout-tab-selector">
          {WORKOUT_SPLIT.map((w) => (
            <button
              key={w.id}
              id={`pick-workout-${w.id}`}
              onClick={() => handleWorkoutSelect(w.id)}
              className={`flex-1 py-1 px-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all duration-150 cursor-pointer ${
                selectedWorkoutId === w.id
                  ? 'bg-[#FF5F00] text-black shadow '
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>

        {/* Interactive Muscle Group Alignment diagram block as Print 4 */}
        <div className="p-3 bg-black/40 rounded-2xl border border-stone-900/60 flex items-center gap-3 relative overflow-hidden" id="anatomy-and-list-grid">
          {/* Subtle grid background scanlines */}
          <div className="absolute inset-y-0 left-1/3 w-[1px] bg-white/[0.02]" />

          {/* Left Column: Avatar Boneco do Print 5 - Redesigned for ultra precise contrast */}
          <div className="w-[45%] flex flex-col justify-center items-center font-sans" id="muscle-avatar-container-left">
            <svg 
              className="w-24 h-24 max-w-[100px] transition-all filter" 
              viewBox="0 0 100 100"
            >
              <g className="transition-all duration-300">
                {/* 1. Body Base Shadow Skeleton */}
                <path d="M50,15 L50,92" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="3,3" strokeOpacity="0.15" />

                {/* 2. Head & Neck */}
                <circle cx="50" cy="11" r="5" fill="#2d2d3a" stroke="#4a4a5a" strokeWidth="1" />
                <path d="M47,16 L53,16 L52,21 L48,21 Z" fill="#2d2d3a" stroke="#4a4a5a" strokeWidth="1" />

                {/* 3. Trapezius */}
                <path 
                  d="M44,21 C44,21 42,23 37,25 C36,25.5 39,28 44,28 L56,28 C61,28 64,25.5 63,25 C58,23 56,21 56,21 Z" 
                  fill={isTrapActive ? activeColor : inactiveFill}
                  stroke={isTrapActive ? activeStrokeColor : inactiveStroke}
                  strokeWidth={isTrapActive ? "1.5" : "1"}
                  className="transition-all duration-300"
                />

                {/* 4. Shoulder Heads */}
                <path 
                  d="M36,25 C31,27 28,31 29,36 C30,39 34,42 37,39 C38,37 38,28 36,25 Z" 
                  fill={isShoulderActive ? activeColor : inactiveFill}
                  stroke={isShoulderActive ? activeStrokeColor : inactiveStroke}
                  strokeWidth={isShoulderActive ? "1.5" : "1"}
                  className="transition-all duration-300"
                />
                <path 
                  d="M64,25 C69,27 72,31 71,36 C70,39 66,42 63,39 C62,37 62,28 64,25 Z" 
                  fill={isShoulderActive ? activeColor : inactiveFill}
                  stroke={isShoulderActive ? activeStrokeColor : inactiveStroke}
                  strokeWidth={isShoulderActive ? "1.5" : "1"}
                  className="transition-all duration-300"
                />

                {/* Left/Right Arms (Triceps / Biceps highlight) */}
                <path 
                  d="M28,38 C25,43 23,50 24,58 C25,59 27,59 27,58 C26,50 28,44 31,40 Z" 
                  fill={isArmsActive ? activeColor : inactiveFill}
                  stroke={isArmsActive ? activeStrokeColor : inactiveStroke}
                  strokeWidth={isArmsActive ? "1.5" : "1"}
                  className="transition-all duration-300"
                />
                <path 
                  d="M72,38 C75,43 77,50 76,58 C75,59 73,59 73,58 C74,50 72,44 69,40 Z" 
                  fill={isArmsActive ? activeColor : inactiveFill}
                  stroke={isArmsActive ? activeStrokeColor : inactiveStroke}
                  strokeWidth={isArmsActive ? "1.5" : "1"}
                  className="transition-all duration-300"
                />

                {/* 5. Chest Clavicular Fibers */}
                <path 
                  d="M38,29 C44,30 50,31 50,31 L50,43 L38,39 Z" 
                  fill={isChestActive ? activeColor : inactiveFill}
                  stroke={isChestActive ? activeStrokeColor : inactiveStroke}
                  strokeWidth={isChestActive ? "1.5" : "1"}
                  className="transition-all duration-300"
                />
                <path 
                  d="M62,29 C56,30 50,31 50,31 L50,43 L62,39 Z" 
                  fill={isChestActive ? activeColor : inactiveFill}
                  stroke={isChestActive ? activeStrokeColor : inactiveStroke}
                  strokeWidth={isChestActive ? "1.5" : "1"}
                  className="transition-all duration-300"
                />

                {/* 6. Latissimus Dorsi (Costas Largas Wings) */}
                <path 
                  d="M37,39 C34,43 36,52 39,59 C40,61 44,53 45,43 Z" 
                  fill={isBackActive ? activeColor : inactiveFill}
                  stroke={isBackActive ? activeStrokeColor : inactiveStroke}
                  strokeWidth={isBackActive ? "1.5" : "1"}
                  className="transition-all duration-300"
                />
                <path 
                  d="M63,39 C66,43 64,52 61,59 C60,61 56,53 55,43 Z" 
                  fill={isBackActive ? activeColor : inactiveFill}
                  stroke={isBackActive ? activeStrokeColor : inactiveStroke}
                  strokeWidth={isBackActive ? "1.5" : "1"}
                  className="transition-all duration-300"
                />

                {/* 7. Abdominal Core Center Column */}
                <path 
                  d="M45,43 L55,43 L54,58 L46,58 Z" 
                  fill={isCoreActive ? activeColor : inactiveFill}
                  stroke={isCoreActive ? activeStrokeColor : inactiveStroke}
                  strokeWidth={isCoreActive ? "1.5" : "1"}
                  className="transition-all duration-300"
                />

                {/* 8. Pelvis Block */}
                <polygon points="44,59 56,59 54,67 46,67" fill="#1f1f2a" stroke="#3a3a4c" strokeWidth="1" />

                {/* 9. Thighs / Legs Area */}
                <path 
                  d="M36,68 L47,68 L45,86 L34,86 Z" 
                  fill={isLegsActive ? activeColor : inactiveFill}
                  stroke={isLegsActive ? activeStrokeColor : inactiveStroke}
                  strokeWidth={isLegsActive ? "1.5" : "1"}
                  className="transition-all duration-300"
                />
                <path 
                  d="M64,68 L53,68 L55,86 L66,86 Z" 
                  fill={isLegsActive ? activeColor : inactiveFill}
                  stroke={isLegsActive ? activeStrokeColor : inactiveStroke}
                  strokeWidth={isLegsActive ? "1.5" : "1"}
                  className="transition-all duration-300"
                />

                {/* Calves Area (lower legs) */}
                <path 
                  d="M34,86 L35,95 L39,95 L45,86 Z" 
                  fill={isCalvesActive ? activeColor : inactiveFill}
                  stroke={isCalvesActive ? activeStrokeColor : inactiveStroke}
                  strokeWidth={isCalvesActive ? "1.5" : "1"}
                  className="transition-all duration-300"
                />
                <path 
                  d="M66,86 L65,95 L61,95 L55,86 Z" 
                  fill={isCalvesActive ? activeColor : inactiveFill}
                  stroke={isCalvesActive ? activeStrokeColor : inactiveStroke}
                  strokeWidth={isCalvesActive ? "1.5" : "1"}
                  className="transition-all duration-300"
                />
              </g>
            </svg>
          </div>

          {/* Right Column: Print 4 Architecture buttons lists */}
          <div className="w-[55%] flex flex-col gap-1.5" id="muscle-p4-list">
            <span className="text-[7.5px] uppercase font-bold tracking-widest text-[#FF5F00] font-mono italic">
              Foco Anatômico Destaque
            </span>
            
            {subgroups.map((sg, idx) => {
              const isSelectedOnly = activeSubgroupIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveSubgroupIdx(isSelectedOnly ? null : idx)}
                  className={`py-1.5 px-2.5 rounded-xl border flex flex-col justify-center text-left transition-all cursor-pointer w-full leading-none ${
                    isSelectedOnly
                      ? 'bg-[#FF5F00] text-black border-transparent font-[900] shadow-md shadow-[#FF5F00]/20'
                      : 'bg-[#121217] border-white/[0.03] text-white/50 hover:bg-white/[0.02]'
                  }`}
                  id={`sg-p4-pill-${idx}`}
                >
                  <span className={`text-[10px] font-black tracking-tight leading-none uppercase select-none ${
                    isSelectedOnly ? 'text-black' : 'text-white'
                  }`}>
                    {sg.name}
                  </span>
                  <span className={`text-[6.5px] font-bold block mt-1 leading-none select-none ${
                    isSelectedOnly ? 'text-black/60 font-black' : 'text-stone-600'
                  }`}>
                    {sg.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected target metadata summary area */}
        <div className="px-1 mt-1 text-center" id="workout-meta-compact-p5">
          <h3 className="text-sm font-black italic uppercase tracking-wider text-white leading-none">
            {selectedWorkout.title}
          </h3>
          <p className="text-stone-400 text-[9px] font-bold uppercase tracking-wider mt-1.5 leading-tight font-sans">
            {selectedWorkout.description} ({selectedWorkout.exercises.length} EXERCÍCIOS)
          </p>
        </div>

        {/* Active trigger workout target call directly launching training flow */}
        <button
          id="btn-trigger-esmagar"
          onClick={() => {
            startWorkout(selectedWorkout.id);
            onNavigateToWorkouts();
          }}
          className="w-full py-3 bg-[#FF5F00] hover:bg-[#FF8C00] text-black font-[950] tracking-widest uppercase italic rounded-2xl transform active:scale-[0.98] transition-all text-center flex items-center justify-center gap-1.5 duration-100 cursor-pointer text-xs"
        >
          <Activity className="w-3.5 h-3.5 fill-black text-black" />
          INICIAR TREINO 🔥
        </button>
      </div>

      {/* 3. CONSTÂNCIA SEMANAL: Highly sleek dark-themed compact bar (fits perfectly) */}
      <div className="bg-[#0b0b10] rounded-[1.8rem] border border-stone-850 p-3.5 shadow-xl text-center" id="weekly-consistency-module">
        <span className="text-[8px] tracking-[0.2em] font-extrabold text-stone-500 uppercase mb-2 block font-mono">
          CONSTÂNCIA SEMANAL
        </span>

        <div className="flex items-center justify-between gap-1 px-1" id="weekly-indicators-grid">
          {daysOfWeek.map((day) => {
            const isToday = new Date().getDay() === day.dayIndex;
            const completed = isDayCompleted(day.dayIndex);
            
            return (
              <div key={day.dayIndex} className="flex flex-col items-center gap-1 flex-1" id={`day-indicator-col-${day.dayIndex}`}>
                <span className="text-[8.5px] font-bold text-stone-500 uppercase tracking-widest leading-none mb-0.5">{day.label}</span>
                <div 
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                    completed 
                      ? 'bg-[#FF5F00]/15 border-[#FF5F05]/40 text-[#FF5F00]' 
                      : isToday
                        ? 'bg-[#181822] border-white text-white shadow-md'
                        : 'bg-[#030305] border-stone-900 text-stone-800'
                  }`}
                >
                  {completed ? (
                    <Dumbbell className="w-3.5 h-3.5 text-[#FF5F00]" />
                  ) : (
                    <Check className="w-2.5 h-2.5 text-stone-900" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <span className="text-[8px] text-stone-600 font-mono font-black uppercase tracking-wider block mt-2" id="weekly-goal-label">
          Meta de treinos atingida: 5 / 5
        </span>
      </div>

    </div>
  );
}
