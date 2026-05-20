import { create } from 'zustand';
import { WORKOUT_SPLIT, Workout, Exercise } from './data';

export interface SetState {
  weight: number;
  reps: number;
  completed: boolean;
}

export interface Athlete {
  name: string;
  email?: string;
  weight: number;
  height: number;
  level: string;
  focus: string;
}

export interface WorkoutHistoryLog {
  id: string;
  date: string;
  workoutId: string;
  workoutTitle: string;
  durationMinutes: number;
  exercisesCompletedCount: number;
  setsCompletedCount: number;
  exercises: {
    name: string;
    bestLoad: number;
    sets: { weight: number; reps: number }[];
  }[];
  photo?: string;
}

interface GymStore {
  athlete: Athlete;
  activeWorkoutId: string | null;
  isActive: boolean;
  startTime: number | null;
  workoutState: Record<string, SetState[]>; // exerciseId -> SetState[]
  lastWeightHistory: Record<string, number>; // exerciseId -> weight in kg
  historyLogs: WorkoutHistoryLog[];
  
  // Actions
  startWorkout: (workoutId: string) => void;
  startTrainingTimer: () => void;
  updateWorkoutSet: (exerciseId: string, setIndex: number, fields: Partial<SetState>) => void;
  completeWorkout: (photoBase64?: string) => void;
  cancelWorkout: () => void;
  updateAthlete: (fields: Partial<Athlete>) => void;
  loadFromStorage: () => void;
  saveActiveSession: () => void;
  deleteHistoryLog: (logId: string) => void;
}

export const useGymStore = create<GymStore>((set, get) => ({
  athlete: {
    name: "Henrique",
    weight: 67,
    height: 1.68,
    level: "Avançado",
    focus: "Estética Avançada (Foco Costas Largas, Peito Superior, Ombro Lateral)"
  },
  activeWorkoutId: null,
  isActive: false,
  startTime: null,
  workoutState: {},
  lastWeightHistory: {},
  historyLogs: [],

  startWorkout: (workoutId: string) => {
    const workout = WORKOUT_SPLIT.find(w => w.id === workoutId);
    if (!workout) return;

    const lastWeights = get().lastWeightHistory;
    const initialStates: Record<string, SetState[]> = {};

    workout.exercises.forEach(ex => {
      // Use previously recorded weight or standard default weight
      const preloadedWeight = lastWeights[ex.id] !== undefined ? lastWeights[ex.id] : ex.defaultWeight;
      
      initialStates[ex.id] = Array.from({ length: ex.seriesCount }, () => ({
        weight: preloadedWeight,
        reps: ex.defaultReps,
        completed: false
      }));
    });

    set({
      activeWorkoutId: workoutId,
      isActive: true,
      startTime: null, // Start workout without running the timer immediately
      workoutState: initialStates
    });

    // Save immediate start state
    get().saveActiveSession();
  },

  startTrainingTimer: () => {
    set({
      startTime: Date.now()
    });
    get().saveActiveSession();
  },

  updateWorkoutSet: (exerciseId: string, setIndex: number, fields: Partial<SetState>) => {
    set(state => {
      const currentSets = state.workoutState[exerciseId] ? [...state.workoutState[exerciseId]] : [];
      if (currentSets.length === 0) return {};

      // Prepare target update
      const updatedSet = { ...currentSets[setIndex], ...fields };
      currentSets[setIndex] = updatedSet;

      // Replication Rule:
      // "o preenchimento ou alteração da primeira série (Série 1) replica instantaneamente os mesmos valores para todas as séries subsequentes daquele exercício, mantendo o estado aberto para edições manuais individuais"
      if (setIndex === 0) {
        for (let i = 1; i < currentSets.length; i++) {
          // Only replicate if those fields were provided in update
          currentSets[i] = {
            ...currentSets[i],
            ...(fields.weight !== undefined ? { weight: fields.weight } : {}),
            ...(fields.reps !== undefined ? { reps: fields.reps } : {})
          };
        }
      }

      return {
        workoutState: {
          ...state.workoutState,
          [exerciseId]: currentSets
        }
      };
    });

    // Auto save to preserve active changes
    get().saveActiveSession();
  },

  completeWorkout: (photoBase64?: string) => {
    const { activeWorkoutId, startTime, workoutState, lastWeightHistory, historyLogs } = get();
    if (!activeWorkoutId) return;

    const workout = WORKOUT_SPLIT.find(w => w.id === activeWorkoutId);
    if (!workout) return;

    const durationMinutes = startTime ? Math.round((Date.now() - startTime) / 60000) : 0;
    
    // Process weights to save to history & update lastWeightHistory state
    const updatedWeights = { ...lastWeightHistory };
    const exercisesCompletedList: WorkoutHistoryLog['exercises'] = [];
    let completedSetsCount = 0;

    workout.exercises.forEach(ex => {
      const sets = workoutState[ex.id] || [];
      // Grab weights to identify maximum or last completed weight
      const completedSets = sets.filter(s => s.completed);
      completedSetsCount += completedSets.length;

      // The final weight logged in this exercise during this session
      // We will take the maximum weight among logged/completed sets, or the first series weight if none was marked as completed
      const defaultSetWeight = sets[0]?.weight ?? ex.defaultWeight;
      const loggedWeight = completedSets.length > 0 
        ? completedSets[completedSets.length - 1].weight 
        : defaultSetWeight;

      updatedWeights[ex.id] = loggedWeight;

      exercisesCompletedList.push({
        name: ex.name,
        bestLoad: Math.max(...sets.map(s => s.weight)),
        sets: sets.map(s => ({ weight: s.weight, reps: s.reps }))
      });
    });

    const newLog: WorkoutHistoryLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString(),
      workoutId: activeWorkoutId,
      workoutTitle: workout.title,
      durationMinutes: Math.max(1, durationMinutes),
      exercisesCompletedCount: workout.exercises.length,
      setsCompletedCount: completedSetsCount,
      exercises: exercisesCompletedList,
      photo: photoBase64
    };

    const updatedLogs = [newLog, ...historyLogs];

    set({
      activeWorkoutId: null,
      isActive: false,
      startTime: null,
      workoutState: {},
      lastWeightHistory: updatedWeights,
      historyLogs: updatedLogs
    });

    // Persist finalized data to localStorage
    localStorage.setItem('tatu_gym_history_weights', JSON.stringify(updatedWeights));
    localStorage.setItem('tatu_gym_history_logs', JSON.stringify(updatedLogs));
    
    // Clear active session cached state
    localStorage.removeItem('tatu_gym_active_session');
  },

  cancelWorkout: () => {
    set({
      activeWorkoutId: null,
      isActive: false,
      startTime: null,
      workoutState: {}
    });
    localStorage.removeItem('tatu_gym_active_session');
  },

  updateAthlete: (fields: Partial<Athlete>) => {
    set(state => {
      const updatedAthlete = { ...state.athlete, ...fields };
      localStorage.setItem('tatu_gym_athlete', JSON.stringify(updatedAthlete));
      return { athlete: updatedAthlete };
    });
  },

  deleteHistoryLog: (logId: string) => {
    const { historyLogs } = get();
    const updated = historyLogs.filter(log => log.id !== logId);
    set({ historyLogs: updated });
    localStorage.setItem('tatu_gym_history_logs', JSON.stringify(updated));
  },

  saveActiveSession: () => {
    const { activeWorkoutId, isActive, startTime, workoutState } = get();
    if (!isActive) return;

    const payload = JSON.stringify({
      activeWorkoutId,
      isActive,
      startTime,
      workoutState
    });
    localStorage.setItem('tatu_gym_active_session', payload);
  },

  loadFromStorage: () => {
    try {
      // 1. Load athlete
      const storedAthlete = localStorage.getItem('tatu_gym_athlete');
      if (storedAthlete) {
        const parsed = JSON.parse(storedAthlete);
        let updated = false;
        if (parsed.weight === 84.5) {
          parsed.weight = 67;
          updated = true;
        }
        if (parsed.height === 1.81) {
          parsed.height = 1.68;
          updated = true;
        }
        if (parsed.email) {
          delete parsed.email;
          updated = true;
        }
        set({ athlete: parsed });
        if (updated) {
          localStorage.setItem('tatu_gym_athlete', JSON.stringify(parsed));
        }
      }

      // 2. Load historical weights to pre-load on sessions
      const storedWeights = localStorage.getItem('tatu_gym_history_weights');
      if (storedWeights) {
        set({ lastWeightHistory: JSON.parse(storedWeights) });
      }

      // 3. Load completed logs
      const storedLogs = localStorage.getItem('tatu_gym_history_logs');
      if (storedLogs) {
        set({ historyLogs: JSON.parse(storedLogs) });
      }

      // 4. Load running active session if exists
      const storedActiveSession = localStorage.getItem('tatu_gym_active_session');
      if (storedActiveSession) {
        const parsed = JSON.parse(storedActiveSession);
        if (parsed && parsed.isActive) {
          set({
            activeWorkoutId: parsed.activeWorkoutId,
            isActive: parsed.isActive,
            startTime: parsed.startTime,
            workoutState: parsed.workoutState
          });
        }
      }
    } catch (e) {
      console.error("Error loading Tatu Gym store from localStorage:", e);
    }
  }
}));
