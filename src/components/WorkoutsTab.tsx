import React, { useState, useEffect, useRef } from 'react';
import { useGymStore, SetState } from '../store';
import { WORKOUT_SPLIT } from '../data';
import { 
  Play, Pause, Award, Trash2, ShieldAlert, CheckCircle2, Circle, 
  Hourglass, Plus, Minus, Check, ChevronRight, Moon, Bell, 
  AlertTriangle, SkipForward, ArrowLeft, Eye, X, Camera, Download, Sparkles, Image
} from 'lucide-react';

export default function WorkoutsTab() {
  const { 
    activeWorkoutId, 
    isActive, 
    startTime, 
    workoutState, 
    updateWorkoutSet, 
    startWorkout,
    completeWorkout, 
    cancelWorkout,
    startTrainingTimer
  } = useGymStore();

  const activeWorkout = WORKOUT_SPLIT.find(w => w.id === activeWorkoutId);

  // Time elapsed counter from workout initiation
  const [elapsed, setElapsed] = useState('00:00');

  // Core countdown rest timer states
  const [timerActive, setTimerActive] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [timerTotalDuration, setTimerTotalDuration] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [timerExerciseName, setTimerExerciseName] = useState('');
  const [timerSetIndex, setTimerSetIndex] = useState(0);

  // Overlay Drawer/Bottom-sheet state for current targeted exercise
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  // Sound, Bip & Flash Settings
  const [muted, setMuted] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  // Confirms trigger overlays
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showSuccessCheck, setShowSuccessCheck] = useState(false);

  // Profile Custom photo builders and canvas stages
  const [showShareBuilder, setShowShareBuilder] = useState(false);
  const [shareCardPhoto, setShareCardPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // WakeLock State
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // 1. Core stopwatch for workout duration
  useEffect(() => {
    if (!isActive || !startTime) {
      setElapsed('NÃO INICIADO');
      return;
    }

    const updateElapsed = () => {
      const diffMs = Date.now() - startTime;
      const totalSecs = Math.floor(diffMs / 1000);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      setElapsed(
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // 2. WakeLock Setup to keep page awake automatically on active logs
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        if (wakeLockRef.current) {
          await wakeLockRef.current.release();
        }
        const lock = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current = lock;
        setWakeLockActive(true);
        lock.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      } catch (err: any) {
        console.warn(`WakeLock failed: ${err.message}`);
        setWakeLockActive(false);
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setWakeLockActive(false);
      } catch (e) {
        console.error('Error releasing wakeLock:', e);
      }
    }
  };

  useEffect(() => {
    if (isActive) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisChange);
      releaseWakeLock();
    };
  }, [isActive]);

  // 3. Counting down rest timer core loop
  useEffect(() => {
    if (timerActive && timerSecondsLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev <= 1) {
            triggerTimerEndAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerSecondsLeft === 0) {
      setTimerActive(false);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerActive, timerSecondsLeft]);

  // beep end sound trigger
  const triggerTimerEndAlert = () => {
    setTimerActive(false);
    setIsFlashing(true);
    
    if (!muted) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
          }, i * 300);
        }
      } catch (e) {
        console.warn('Silent beep playback:', e);
      }
    }

    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch (e) {}
    }

    setTimeout(() => {
      setIsFlashing(false);
    }, 5000);
  };

  const handleToggleSetComplete = (exerciseId: string, exName: string, setIndex: number, currentCompleted: boolean, restSecs: number) => {
    // If user starts logging without explicitly clicking start, trigger start timer automatically
    if (startTime === null) {
      startTrainingTimer();
    }

    const nextCompleted = !currentCompleted;
    updateWorkoutSet(exerciseId, setIndex, { completed: nextCompleted });

    const currentSets = workoutState[exerciseId] || [];
    const simulatedSets = currentSets.map((s, idx) => idx === setIndex ? { ...s, completed: nextCompleted } : s);
    const isNowFinished = simulatedSets.every(s => s.completed);

    if (nextCompleted) {
      // Trigger countdown rest timer on successful series tick
      setTimerExerciseName(exName);
      setTimerSetIndex(setIndex + 1);
      setTimerSecondsLeft(restSecs);
      setTimerTotalDuration(restSecs);
      setTimerActive(true);
      setIsFlashing(false);
    }

    if (isNowFinished && nextCompleted) {
      setShowSuccessCheck(true);
      setTimeout(() => {
        setSelectedExerciseId(null);
        setShowSuccessCheck(false);
      }, 1500);
    }
  };

  const adjustTimer = (seconds: number) => {
    setTimerSecondsLeft(prev => Math.max(0, prev + seconds));
    setTimerTotalDuration(prev => Math.max(1, prev + seconds));
  };

  const skipTimer = () => {
    setTimerSecondsLeft(0);
    setTimerActive(false);
    setIsFlashing(false);
  };

  const togglePauseResumeTimer = () => {
    setTimerActive(prev => !prev);
  };

  const handleInputChange = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', valStr: string) => {
    const val = parseFloat(valStr) || 0;
    updateWorkoutSet(exerciseId, setIndex, { [field]: val });
  };

  // Switch between selection hud and execution view
  const handleStartWorkoutHud = (workoutId: string) => {
    startWorkout(workoutId);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShareCardPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteAndSaveWithCard = (downloadFirst: boolean = false) => {
    if (!activeWorkout) return;

    // Fuses selfie picture and workout metrics onto a virtual 9:16 canvas for a clean share card
    const canvas = document.createElement('canvas');
    canvas.width = 540;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      completeWorkout(shareCardPhoto || undefined);
      setShowShareBuilder(false);
      return;
    }

    const drawTextAndCommit = () => {
      if (!ctx || !activeWorkout) return;
      
      // 2. Add structured dark vignette overlays
      const gradVeil = ctx.createLinearGradient(0, 960, 0, 0);
      gradVeil.addColorStop(0, 'rgba(0, 0, 0, 0.96)');
      gradVeil.addColorStop(0.35, 'rgba(0, 0, 0, 0.75)');
      gradVeil.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
      gradVeil.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = gradVeil;
      ctx.fillRect(0, 0, 540, 960);

      // 3. Neon aesthetic frames
      ctx.strokeStyle = '#FF5F00';
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 526, 946);

      // 4. Header branding marks
      ctx.fillStyle = '#FF5F00';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('TATU GYM • COORDINATES SHAPE CHECKPOINT', 40, 55);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('ESTÉTICA ABC MÁXIMA PERFORMANCE', 40, 72);

      // 5. Giant Stopwatch timer metrics
      ctx.fillStyle = '#FF5F00';
      ctx.font = 'bold 54px monospace';
      ctx.fillText(elapsed, 40, 185);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('DURAÇÃO TOTAL DO TREINO DA SESSÃO', 40, 210);

      // 6. Workout split descriptors
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(activeWorkout.name, 40, 290);

      ctx.fillStyle = '#FF5F00';
      ctx.font = 'italic bold 18px sans-serif';
      ctx.fillText(activeWorkout.title, 40, 322);

      // Records outline panel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(40, 370, 460, 380);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(40, 370, 460, 380);

      ctx.fillStyle = '#FF5F00';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('FITAS DE CARGA REGISTRADAS', 60, 402);

      // Display exercise loads
      let yOffset = 445;
      activeWorkout.exercises.forEach((ex, idx) => {
        if (idx < 5) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(`${idx + 1}. ${ex.name.toUpperCase()}`, 60, yOffset);

          const currentSets = workoutState[ex.id] || [];
          const loggedWeights = currentSets.map(s => `${s.weight}kg`).join(' • ');
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`séries completas: ${loggedWeights || 'exemplo de peso'}`, 60, yOffset + 18);

          yOffset += 54;
        }
      });

      // Stats summaries
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`APROVEITAMENTO: ${completedSetsCount}/${totalSetsCount} SÉRIES COMPLETAS`, 60, 715);

      // Custom watermark footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = 'bold italic 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MENTE BLINDADA, FIBRA ESTÉTICA', 270, 895);

      const computedBase64 = canvas.toDataURL('image/png');

      if (downloadFirst) {
        const link = document.createElement('a');
        link.href = computedBase64;
        link.download = `tatu_gym_${activeWorkout.id}_checkpoint.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Finish state transition in store!
      completeWorkout(computedBase64);
      setShowShareBuilder(false);
      setSelectedExerciseId(null);
      setShareCardPhoto(null);
    };

    // Begin render process
    if (shareCardPhoto) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const imgRatio = img.width / img.height;
        const canvasRatio = 540 / 960;
        let drawWidth = 540;
        let drawHeight = 960;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > canvasRatio) {
          drawWidth = 960 * imgRatio;
          offsetX = (540 - drawWidth) / 2;
        } else {
          drawHeight = 540 / imgRatio;
          offsetY = (960 - drawHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        drawTextAndCommit();
      };
      img.src = shareCardPhoto;
    } else {
      const backGrad = ctx.createLinearGradient(0, 0, 540, 960);
      backGrad.addColorStop(0, '#100501');
      backGrad.addColorStop(0.6, '#060201');
      backGrad.addColorStop(1, '#000000');
      ctx.fillStyle = backGrad;
      ctx.fillRect(0, 0, 540, 960);
      drawTextAndCommit();
    }
  };

  const activeSelectedExercise = activeWorkout?.exercises.find(e => e.id === selectedExerciseId);
  const activeSelectedSets = activeSelectedExercise ? (workoutState[activeSelectedExercise.id] || []) : [];

  // Calculation parameters for workout completion
  let completionPercent = 0;
  let completedSetsCount = 0;
  let totalSetsCount = 0;

  if (activeWorkout) {
    totalSetsCount = Object.values(workoutState).reduce((acc, sets) => acc + sets.length, 0);
    completedSetsCount = Object.values(workoutState).reduce(
      (acc, sets) => acc + sets.filter(s => s.completed).length, 0
    );
    completionPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;
  }

  // Timer Color logic according to UI instructions (Laranja, Cinza-claro se pausado, Piscando em laranja neon último 10s)
  const getTimerColorClass = () => {
    if (!timerActive && timerSecondsLeft > 0) return 'text-[#A3A3A3]'; // light gray if paused
    if (timerSecondsLeft > 0 && timerSecondsLeft <= 10) return 'text-[#FF2200] animate-pulse'; // urgent red-orange blinking
    return 'text-[#FF5F00]'; // default orange
  };

  return (
    <div className={`flex flex-col h-full bg-[#050505] text-[#F5F5F5] overflow-y-auto pb-24`} id="workouts-view-root">
      
      {/* ==================== VIEW 1: SELECTION HUB ==================== */}
      {!isActive && (
        <div className="flex flex-col h-full" id="selection-hub-outer">
          
          {/* Header */}
          <div className="bg-[#0c0c0c] border-b border-white/10 px-6 py-6 pb-8 rounded-b-[2rem] shadow-2xl relative overflow-hidden" id="workouts-header">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5F00] rounded-full blur-3xl opacity-[0.06] -mr-6 -mt-6"></div>
            <h1 className="text-3xl font-[900] italic uppercase tracking-tight text-white" id="title-workouts-hub">
              TREINOS <span className="text-[#FF5F00]">TATU GYM</span>
            </h1>
            <p className="text-white/60 text-xs mt-1.5 italic max-w-sm" id="desc-workouts-hub">
              Selecione o protocolo fisiológico prescrito para a sessão de Henrique hoje e esmague as cargas.
            </p>
          </div>

          {/* Workouts Grid */}
          <div className="px-4 py-6 space-y-5" id="workouts-hud-container">
            
            {/* Split cards: A and B side-by-side, C full width below */}
            <div className="grid grid-cols-2 gap-3.5" id="ab-split-row">
              {WORKOUT_SPLIT.slice(0, 2).map((w) => (
                <div 
                  key={w.id} 
                  id={`workout-grid-card-${w.id}`}
                  onClick={() => handleStartWorkoutHud(w.id)}
                  className="bg-gradient-to-tr from-[#0a0a0a] to-[#121212] border border-white/10 hover:border-white/20 hover:scale-[1.01] rounded-2xl p-4 flex flex-col justify-between min-h-[170px] shadow-2xl transition-all cursor-pointer group relative"
                >
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#FF5F00]/40"></div>
                  <div>
                    <span className="text-[9px] font-black text-[#FF5F00] bg-[#FF5F00]/10 border border-[#FF5F00]/25 px-2 py-0.5 rounded-md uppercase tracking-wider block w-max">
                      {w.name}
                    </span>
                    <h3 className="text-base font-[900] text-white italic uppercase tracking-tight leading-snug mt-2 group-hover:text-[#FF5F00] transition-colors">
                      {w.title.replace(' & ', ' & \n')}
                    </h3>
                    <p className="text-[10px] text-white/40 font-semibold tracking-wider uppercase mt-1">
                      {w.exercises.length} EXERCÍCIOS
                    </p>
                  </div>

                  <span className="text-[10px] font-black text-[#FF5F00] flex items-center gap-1 group-hover:translate-x-1.5 transition-transform mt-4 uppercase tracking-widest italic">
                    TREINAR <ChevronRight className="w-3 h-3 stroke-[3]" />
                  </span>
                </div>
              ))}
            </div>

            {/* Treino C - Full Width below */}
            {WORKOUT_SPLIT.slice(2, 3).map((w) => (
              <div 
                key={w.id} 
                id={`workout-grid-card-${w.id}`}
                onClick={() => handleStartWorkoutHud(w.id)}
                className="bg-gradient-to-tr from-[#0a0a0a] to-[#121212] border border-white/10 hover:border-white/20 hover:scale-[1.005] rounded-2xl p-4.5 flex items-center justify-between shadow-2xl transition-all cursor-pointer group relative"
              >
                <div id="treinoc-text">
                  <span className="text-[9px] font-black text-[#FF5F00] bg-[#FF5F00]/10 border border-[#FF5F00]/25 px-2 py-0.5 rounded-md uppercase tracking-wider block w-max">
                    {w.name}
                  </span>
                  <h3 className="text-lg font-[900] text-white italic uppercase tracking-tight leading-snug mt-1.5 group-hover:text-[#FF5F00] transition-colors">
                    {w.title}
                  </h3>
                  <p className="text-xs text-white/50 mt-1">
                    {w.focus}
                  </p>
                  <p className="text-[10px] text-white/40 font-semibold tracking-wider uppercase mt-1">
                    {w.exercises.length} EXERCÍCIOS COMPACTOS
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 ml-4" id="treinoc-cta">
                  <span className="text-xs font-black text-white bg-white/5 border border-white/15 hover:bg-[#FF5F00] hover:text-black hover:border-transparent px-3.5 py-2 rounded-xl flex items-center gap-1 transition-all uppercase tracking-wider italic">
                    TREINAR <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </span>
                </div>
              </div>
            ))}

            {/* Empty disclaimer of discipline */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-3 text-xs text-white/60 leading-relaxed italic" id="disciplina-footer">
              <ShieldAlert className="w-5 h-5 text-white/30 flex-shrink-0 mt-0.5" />
              <p>
                "O progresso estético de Henrique reside na consistência linear. Complete as séries sem roubar, registre as cargas e respeite o repouso planejado."
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ==================== VIEW 2: ACTIVE WORKOUT EXECUTION ==================== */}
      {isActive && activeWorkout && (
        <div className={`flex flex-col h-full`} id="active-execution-outer">
          
          {/* Top Absolute Status Control */}
          <div className="bg-[#0c0c0c] border-b border-white/10 px-6 py-4 flex items-center justify-between" id="execution-navbar">
            <button
              id="back-to-selection-hud-btn"
              onClick={() => setShowCancelConfirm(true)}
              className="text-xs font-black text-white/40 hover:text-white uppercase tracking-wider flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#FF5F00]" />
              Descartar
            </button>
            
            <div className="flex flex-col items-center text-center" id="execution-active-pings">
              <div className="flex items-center gap-1.5 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5F00] inline-block animate-ping"></span>
                <span className="text-xs font-black text-white font-mono tracking-wider uppercase">
                  {activeWorkout.name}
                </span>
              </div>
              <span className="text-[10px] text-[#A3A3A3] font-mono font-bold mt-0.5" id="mini-elapsed-stopwatch">
                TEMPO: {elapsed}
              </span>
            </div>

            <button
              id="concluir-action-nav-btn"
              onClick={() => setShowCompleteConfirm(true)}
              className="text-xs font-black text-[#FF5F00] hover:text-white uppercase tracking-wider bg-[#FF5F00]/10 px-2.5 py-1 rounded border border-[#FF5F00]/25"
            >
              Gravar
            </button>
          </div>

          {/* Subtle countdown banner on exercise list screen */}
          {timerSecondsLeft > 0 && (
            <div className="bg-[#FF5F00]/5 border-b border-[#FF5F00]/10 px-5 py-2.5 flex items-center justify-between text-xs" id="subtle-rest-running-pill">
              <span className="text-white/60 font-medium italic">Descanso Ativo: {timerExerciseName} (S{timerSetIndex})</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-black tracking-widest ${getTimerColorClass()}`}>{timerSecondsLeft}s</span>
                <button 
                  onClick={skipTimer} 
                  className="text-[9px] font-black text-black bg-[#FF5F00] hover:bg-[#FF8C00] px-2 py-0.5 rounded italic uppercase"
                >
                  Pular
                </button>
              </div>
            </div>
          )}

          {/* Workout progress stats */}
          <div className="px-5 py-3.5 bg-[#0a0a0a] border-b border-white/15 flex justify-between items-center" id="session-progress-banner">
            <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider">Aproveitamento</span>
            <div className="flex items-center gap-2 flex-1 max-w-[150px] mx-3" id="prog-mini-bar">
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#FF5F00] h-full" style={{ width: `${completionPercent}%` }}></div>
              </div>
            </div>
            <span className="text-[10px] font-black text-white font-mono">{completedSetsCount}/{totalSetsCount} ({completionPercent}%)</span>
          </div>

          {/* Horizontal, compact lists of Exercises */}
          <div className="px-4 py-3 space-y-3" id="execution-exercises-vertical-list">
            
            {startTime === null && (
              <div className="p-5 bg-gradient-to-tr from-[#0a0a0a] via-[#121212] to-[#040404] border border-[#FF5F00]/30 rounded-2xl text-center shadow-xl relative overflow-hidden my-2" id="training-gate-inner">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF5F00] rounded-full blur-2xl opacity-[0.06] -mr-4 -mt-4"></div>
                <div className="flex justify-center mb-1.5 animate-pulse" id="gate-icon-con">
                  <Play className="w-6 h-6 text-[#FF5F00]" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider italic">
                  TREINO SELECIONADO: {activeWorkout.title}
                </h3>
                <p className="text-[10px] text-white/50 leading-relaxed mt-1 mb-3.5 max-w-xs mx-auto italic">
                  A fita de cargas de Henrique foi carregada com sucesso. Toque abaixo para acionar o cronômetro oficial e começar a treinar!
                </p>
                <button
                  id="btn-trigger-start-timer-inner"
                  onClick={(e) => {
                    e.stopPropagation();
                    startTrainingTimer();
                  }}
                  className="w-full py-2.5 bg-[#FF5F00] hover:bg-[#FF8C00] text-black text-xs font-black rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-lg shadow-[#FF5F00]/10 italic transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-black stroke-black translate-x-0.5" />
                  INICIAR TREINO 🔥
                </button>
              </div>
            )}

            <span className="text-[9px] uppercase font-black text-white/30 tracking-widest block pl-1">
              LISTA DE EXERCÍCIOS PARA FILTRAR
            </span>

            {activeWorkout.exercises.map((ex, exIdx) => {
              const sets = workoutState[ex.id] || [];
              const completedCount = sets.filter(s => s.completed).length;
              const isAllSetsCompleted = completedCount === sets.length;

              return (
                <div 
                  key={ex.id}
                  id={`execution-exercise-row-${ex.id}`}
                  onClick={() => setSelectedExerciseId(ex.id)}
                  className={`bg-white/5 border rounded-2xl p-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.08] hover:border-white/20 shadow-lg transition-all ${
                    isAllSetsCompleted 
                      ? 'border-emerald-500/20 bg-emerald-505/5 opacity-80' 
                      : selectedExerciseId === ex.id 
                        ? 'border-[#FF5F00] bg-[#FF5F00]/[0.02]' 
                        : 'border-white/10'
                  }`}
                >
                  <div className="truncate flex-1" id={`row-meta-${ex.id}`}>
                    <div className="flex items-center gap-1.5" id={`row-badges-${ex.id}`}>
                      <span className="text-[9px] font-black bg-white/10 text-white/70 px-1 py-0.5 rounded italic">
                        #{exIdx + 1}
                      </span>
                      <span className="text-[9px] text-[#FF5F00] font-bold uppercase tracking-wider">
                        {ex.group}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-white mt-1 italic uppercase tracking-normal truncate" id={`row-name-${ex.id}`}>
                      {ex.name}
                    </h4>

                    {/* Sets quick representation logs */}
                    <div className="flex items-center gap-1 mt-1.5" id={`row-capsules-indicators-${ex.id}`}>
                      {sets.map((s, idx) => (
                        <span 
                          key={idx} 
                          className={`w-4.5 h-4.5 text-[8px] font-black rounded-md flex items-center justify-center border font-mono ${
                            s.completed 
                              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                              : 'bg-black/40 border-white/10 text-white/30'
                          }`}
                        >
                          S{idx + 1}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 flex items-center gap-3" id={`row-action-indicator-${ex.id}`}>
                    <div className="text-right">
                      <span className="text-[9px] text-white/40 uppercase block">Progresso</span>
                      <span className="text-xs font-black text-white font-mono mt-0.5 block">{completedCount}/{sets.length}</span>
                    </div>
                    <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#FF5F00]" id={`btn-open-detail-${ex.id}`}>
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer absolute control */}
          <div className="p-4 bg-[#0c0c0c] border-t border-white/10 flex justify-between gap-4 mt-8" id="footer-actions-tray">
            <button
              id="discard-treino-tray-btn"
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-3 border border-red-500/20 text-red-400 text-xs font-black rounded-xl hover:bg-red-950/20 flex items-center gap-1 uppercase transition-all"
            >
              <Trash2 className="w-4 h-4" />
              DESBOTAR
            </button>
            <button
              id="finalizar-treino-tray-btn"
              onClick={() => setShowCompleteConfirm(true)}
              className="flex-1 py-3 bg-[#FF5F00] hover:bg-[#FF8C00] text-black text-xs font-[900] rounded-xl flex items-center justify-center gap-1 uppercase tracking-widest shadow-xl shadow-[#FF5F00]/20 italic transition-all"
            >
              CONCLUIR TREINO
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

        </div>
      )}

      {/* ==================== VIEW 3: DISCRETO MODAL / GLASSMORPHIC DRAWER SHEET ==================== */}
      {isActive && activeSelectedExercise && (
        <div 
          id="muscle-drawer-overlay"
          className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-start justify-center z-50 transition-opacity duration-300 pointer-events-auto overflow-y-auto p-4 pt-6 sm:pt-14"
        >
          {/* Floating modal card container */}
          <div 
            id="muscle-drawer-sheet-body"
            className="w-full max-w-md bg-[#0a0a0f] border border-white/15 rounded-2xl p-4.5 shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-3.5 animate-slideDown relative pb-6"
          >
            
            {/* Title header */}
            <div className="flex items-start justify-between border-b border-white/5 pb-2" id="drawer-header-content">
              <div>
                <div className="flex items-center gap-1.5" id="drawer-header-badge-row">
                  <span className="text-[7.5px] bg-[#FF5F00] text-black font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                    SÉRIE ATIVA
                  </span>
                  <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">
                    {activeSelectedExercise.group}
                  </span>
                </div>
                
                <h3 className="text-base font-black text-white uppercase italic tracking-wide mt-1" id="drawer-exercise-fullname">
                  {activeSelectedExercise.name}
                </h3>
              </div>
              
              <button
                id="drawer-close-btn"
                onClick={() => setSelectedExerciseId(null)}
                className="p-1 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Success success tick animation overlay inside sheet */}
            {showSuccessCheck && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center flex flex-col items-center justify-center space-y-1 py-4 my-1 animate-bounce" id="drawer-success-box">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-pulse" />
                <h4 className="text-[11px] font-black text-white uppercase tracking-wider">EXERCÍCIO CONCLUÍDO!</h4>
                <p className="text-[9px] text-white/50 italic">Todas as séries gravadas. Retornando para a lista...</p>
              </div>
            )}

            {/* Giant Countdown Rest Timer inside Drawer -> REDUCED BY HALF */}
            {timerSecondsLeft > 0 && !showSuccessCheck && (
              <div 
                id="drawer-massive-timer"
                className="bg-gradient-to-tr from-neutral-900 via-stone-900 to-black border border-[#FF5F00]/30 rounded-2xl py-2 px-3 text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center space-y-1.5 my-1.5"
              >
                {/* Visual back glow */}
                <div className="absolute inset-0 bg-radial-gradient from-[#FF5F00]/5 to-transparent pointer-events-none"></div>

                <span className="text-[8px] uppercase tracking-widest font-black text-white/40">
                  {timerActive ? 'INTERVALO ATIVO DE REPOUSO' : 'CONTAGEM PARADA'}
                </span>

                <div 
                  id="drawer-timer-digits"
                  className={`text-3xl font-black font-mono tracking-widest ${getTimerColorClass()} transition-all drop-shadow-[0_0_8px_rgba(255,95,0,0.25)]`}
                >
                  {timerSecondsLeft}s
                </div>

                <span className="text-[8.5px] text-white/50 italic max-w-xs truncate uppercase tracking-wider">
                  Próxima: Série {timerSetIndex} de {activeSelectedExercise.name}
                </span>

                {/* Controls in Drawer */}
                <div className="flex items-center gap-2 pt-0.5" id="drawer-timer-controls">
                  <button
                    onClick={() => adjustTimer(-10)}
                    className="w-6.5 h-6.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white text-[8.5px] font-black font-mono"
                    title="-10s"
                  >
                    -10
                  </button>

                  <button
                    onClick={togglePauseResumeTimer}
                    className="w-7.5 h-7.5 rounded-full flex items-center justify-center bg-[#FF5F00] text-black hover:bg-[#FF8C00] transition-colors"
                  >
                    {timerActive ? <Pause className="w-3 h-3 fill-black stroke-black" /> : <Play className="w-3 h-3 fill-black stroke-black translate-x-0.5" />}
                  </button>

                  <button
                    onClick={() => adjustTimer(10)}
                    className="w-6.5 h-6.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white text-[8.5px] font-black font-mono"
                    title="+10s"
                  >
                    +10
                  </button>

                  <button
                    onClick={skipTimer}
                    className="w-6.5 h-6.5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
                    title="Pular"
                  >
                    <SkipForward className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Instruction Tip directly in Drawer helper */}
            <div className="text-[10px] text-white/60 bg-white/[0.02] border border-white/5 p-2 rounded-xl space-y-1.5 leading-relaxed italic" id="drawer-inst-box">
              <p>"{activeSelectedExercise.description}"</p>
              {activeSelectedExercise.jointProtectionTip && (
                <div className="text-[#FF5F00] flex gap-1 bg-[#FF5F00]/5 p-1.5 rounded-lg border border-[#FF5F00]/15" id="drawer-prot-box">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block text-[9px] tracking-widest uppercase">Manguito & Proteção:</span>
                    <p className="font-semibold text-[9px] leading-tight mt-0.5">{activeSelectedExercise.jointProtectionTip}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Series interactive lines list */}
            <div className="space-y-2 pt-0.5" id="drawer-sets-inter-list">
              
              <div className="flex items-center justify-between px-1" id="drawer-sets-indicator-headers">
                <span className="text-[9px] uppercase font-black tracking-widest text-[#FF5F00]">Séries e cargas estéticas</span>
                <span className="text-[8px] uppercase font-bold text-white/30">Carga (kg) • Reps</span>
              </div>

              {activeSelectedSets.map((set, sIdx) => {
                const isFirstSet = sIdx === 0;
                return (
                  <div 
                    key={sIdx}
                    id={`drawer-set-item-row-${sIdx}`}
                    className={`grid grid-cols-12 gap-1.5 items-center p-1.5 rounded-xl border transition-all ${
                      set.completed 
                        ? 'bg-emerald-500/[0.08] border-emerald-500/20' 
                        : 'bg-black/40 border-white/5'
                    }`}
                  >
                    
                    {/* S1 series designation */}
                    <div className="col-span-2 text-center flex flex-col items-center">
                      <span className="font-black text-[11px] text-white font-mono">S{sIdx + 1}</span>
                      {isFirstSet && (
                        <span className="text-[7px] text-[#FF5F00] font-black tracking-widest uppercase italic block leading-none mt-0.5">
                          REPLICA
                        </span>
                      )}
                    </div>

                    {/* Weight adjustments with clean (-) (+) buttons */}
                    <div className="col-span-4 flex items-center bg-black rounded-lg border border-white/10 p-0.5 overflow-hidden" id={`drawer-weight-block-${sIdx}`}>
                      <button
                        id={`drawer-weight-dec-${sIdx}`}
                        type="button"
                        onClick={() => {
                          const newWeight = Math.max(0, set.weight - 2);
                          handleInputChange(activeSelectedExercise.id, sIdx, 'weight', String(newWeight));
                        }}
                        className="p-1 text-white/40 hover:text-[#FF5F00] transition-colors"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <input
                        id={`drawer-weight-input-${sIdx}`}
                        type="number"
                        step="0.5"
                        className="w-full text-center text-[11px] font-black text-white font-mono bg-transparent outline-none focus:ring-0 p-0"
                        value={set.weight || ''}
                        onChange={(e) => handleInputChange(activeSelectedExercise.id, sIdx, 'weight', e.target.value)}
                      />
                      <button
                        id={`drawer-weight-inc-${sIdx}`}
                        type="button"
                        onClick={() => {
                          const newWeight = set.weight + 2;
                          handleInputChange(activeSelectedExercise.id, sIdx, 'weight', String(newWeight));
                        }}
                        className="p-1 text-white/40 hover:text-[#FF5F00] transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {/* Reps adjustment using smart controls */}
                    <div className="col-span-4 flex items-center bg-black rounded-lg border border-white/10 p-0.5 overflow-hidden" id={`drawer-reps-block-${sIdx}`}>
                      <button
                        id={`drawer-reps-dec-${sIdx}`}
                        type="button"
                        onClick={() => {
                          const newReps = Math.max(0, set.reps - 1);
                          handleInputChange(activeSelectedExercise.id, sIdx, 'reps', String(newReps));
                        }}
                        className="p-1 text-white/40 hover:text-[#FF5F00] transition-colors"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <input
                        id={`drawer-reps-input-${sIdx}`}
                        type="number"
                        className="w-full text-center text-[11px] font-black text-white font-mono bg-transparent outline-none focus:ring-0 p-0"
                        value={set.reps || ''}
                        onChange={(e) => handleInputChange(activeSelectedExercise.id, sIdx, 'reps', e.target.value)}
                      />
                      <button
                        id={`drawer-reps-inc-${sIdx}`}
                        type="button"
                        onClick={() => {
                          const newReps = set.reps + 1;
                          handleInputChange(activeSelectedExercise.id, sIdx, 'reps', String(newReps));
                        }}
                        className="p-1 text-white/40 hover:text-[#FF5F00] transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {/* OK circular 3D toggle check button */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        id={`drawer-btn-complete-${sIdx}`}
                        type="button"
                        onClick={() => handleToggleSetComplete(activeSelectedExercise.id, activeSelectedExercise.name, sIdx, set.completed, activeSelectedExercise.restSeconds)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          set.completed 
                            ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/15' 
                            : 'bg-black border border-white/20 text-white/30 hover:border-[#FF5F00]'
                        }`}
                      >
                        {set.completed ? (
                          <CheckCircle2 className="w-4 h-4 font-black" />
                        ) : (
                          <Circle className="w-4 h-4 text-white/30" />
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* Cancel Confirmation overlay dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50" id="cancel-confirm-hud-dialog">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4" id="dialog-card">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center border border-red-500/20" id="dialog-icon-warn">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white uppercase italic tracking-tight">Descartar Treino Atual?</h3>
            <p className="text-white/60 text-xs leading-relaxed">
              Você perderá os dados de carga, repetições e progresso inseridos nesta fita de execução. Esta ação não poderá ser desconfigurada.
            </p>
            <div className="flex gap-2.5 pt-1" id="dialog-buttons">
              <button
                id="dialog-dismiss"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2 px-3 border border-white/10 text-xs font-bold text-white/70 hover:bg-white/5 rounded-lg transition-colors uppercase tracking-wider"
              >
                Voltar
              </button>
              <button
                id="dialog-confirm"
                onClick={() => {
                  cancelWorkout();
                  setShowCancelConfirm(false);
                  setSelectedExerciseId(null);
                }}
                className="flex-1 py-2 px-3 bg-red-600 text-white text-xs font-black hover:bg-red-700 rounded-lg transition-colors uppercase tracking-wider"
              >
                Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Confirmation overlay dialog */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50" id="complete-confirm-hud-dialog">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4" id="dialog-card-complete">
            <div className="w-12 h-12 bg-[#FF5F00]/10 text-[#FF5F00] rounded-full flex items-center justify-center border border-[#FF5F00]/25" id="dialog-icon-award">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-black text-white uppercase italic tracking-tight">Feito por Hoje, Henrique?</h3>
            <p className="text-white/60 text-xs leading-relaxed">
              Deseja salvar e gravar esta fita de treino concluída? Seus números abastecerão as metas inteligentes do aplicativo!
            </p>
            <div className="flex gap-2.5 pt-1" id="dialog-buttons-complete">
              <button
                id="dialog-complete-dismiss"
                onClick={() => setShowCompleteConfirm(false)}
                className="flex-1 py-2 px-3 border border-white/10 text-xs font-bold text-white/70 hover:bg-white/5 rounded-lg transition-colors uppercase tracking-wider"
              >
                Continuar
              </button>
              <button
                id="dialog-complete-confirm"
                onClick={() => {
                  completeWorkout();
                  setShowCompleteConfirm(false);
                  setSelectedExerciseId(null);
                }}
                className="flex-1 py-2 px-3 bg-[#FF5F00] text-black text-xs font-black hover:bg-[#FF8C00] rounded-lg transition-colors uppercase tracking-wider"
              >
                Gravar Sessão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
