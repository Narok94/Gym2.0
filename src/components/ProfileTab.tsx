import React, { useState } from 'react';
import { useGymStore } from '../store';
import { WORKOUT_SPLIT } from '../data';
import { 
  Award, Calendar, Edit3, Trash2, Download, X, Save, User, 
  Heart, Clock, Dumbbell, ShieldAlert, Camera 
} from 'lucide-react';

export default function ProfileTab() {
  const { athlete, historyLogs, updateAthlete, deleteHistoryLog } = useGymStore() as any;

  // State managers
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Edit form states
  const [formName, setFormName] = useState(athlete.name);
  const [formWeight, setFormWeight] = useState(athlete.weight);
  const [formHeight, setFormHeight] = useState(athlete.height);
  const [formLevel, setFormLevel] = useState(athlete.level || 'Avançado');
  const [formFocus, setFormFocus] = useState(athlete.focus || 'Estética & Simetria');

  const totalWorkouts = historyLogs.length;
  const totalMinutes = historyLogs.reduce((sum: number, log: any) => sum + log.durationMinutes, 0);
  const totalSets = historyLogs.reduce((sum: number, log: any) => sum + log.setsCompletedCount, 0);

  // Trigger saving details to store
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateAthlete({
      name: formName,
      weight: Number(formWeight),
      height: Number(formHeight),
      level: formLevel,
      focus: formFocus,
    });
    setIsEditModalOpen(false);
  };

  // Open edit modal and load current store data
  const openEditModal = () => {
    setFormName(athlete.name);
    setFormWeight(athlete.weight);
    setFormHeight(athlete.height);
    setFormLevel(athlete.level || 'Avançado');
    setFormFocus(athlete.focus || 'Estética & Simetria');
    setIsEditModalOpen(true);
  };

  // Safe download card logic
  const triggerCardDownload = (log: any) => {
    if (!log.photo) return;
    const link = document.createElement('a');
    link.href = log.photo;
    link.download = `tatu_gym_shape_checkpoint_${log.workoutId || 'workout'}_${new Date(log.date).toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format nice Brazilian display date
  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sample static templates for preset wallpaper option if photo is missing
  const defaultPresets = [
    {
      id: 'p1',
      title: 'BLACK CARBON',
      gradient: 'linear-gradient(135deg, #FF5F00 0%, #000000 100%)',
    },
    {
      id: 'p2',
      title: 'SILHOUETTE BEAST',
      gradient: 'linear-gradient(135deg, #5F0E05 0%, #0c0a09 100%)',
    },
    {
      id: 'p3',
      title: 'COSMIC GRAPHITE',
      gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#050508] text-[#F5F5F5] overflow-y-auto pb-24" id="view-profile-tab">
      
      {/* 1. UPPER BRAND & IDENTITY PANEL */}
      <div className="bg-[#0c0c12] border-b border-white/[0.05] px-6 py-6 pb-7 shadow-2xl relative overflow-hidden" id="profile-header">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5F00] rounded-full blur-3xl opacity-[0.06] -mr-6 -mt-6"></div>
        <div className="absolute bottom-0 left-12 w-24 h-24 bg-[#FF5F00] rounded-full blur-3xl opacity-[0.03]"></div>
        
        <div className="flex items-center justify-between mb-4.5" id="profile-title-bar">
          <h1 className="text-lg font-[950] italic uppercase tracking-tight text-white font-sans">
            MÉTRICAS DO <span className="text-[#FF5F00]">ATLETA</span>
          </h1>
          <button
            id="profile-edit-trigger-btn"
            onClick={openEditModal}
            className="flex items-center gap-1 bg-[#FF5F00]/10 hover:bg-[#FF5F00] hover:text-black text-[#FF5F00] text-[9.5px] font-black px-2.5 py-1 rounded-lg border border-[#FF5F00]/20 transition-all cursor-pointer uppercase italic"
          >
            <Edit3 className="w-3 h-3" />
            EDITAR PROFILE
          </button>
        </div>

        {/* Profile Avatar & Info Card */}
        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 p-4 rounded-2xl relative overflow-hidden" id="profile-user-card">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF5F00] to-[#E05300] flex items-center justify-center text-black font-[950] text-2xl shadow-lg italic tracking-wide">
            {athlete.name ? athlete.name.charAt(0).toUpperCase() : 'H'}
          </div>
          <div className="flex-1 min-w-0" id="profile-user-text">
            <h2 className="text-base font-[950] text-white uppercase italic tracking-wide truncate">{athlete.name}</h2>
            <div className="flex flex-wrap gap-1.5 mt-1.5" id="profile-user-badges">
              <span className="text-[8px] font-black uppercase text-[#FF5F00] bg-[#FF5F00]/10 px-2 py-0.5 rounded border border-[#FF5F05]/20 font-mono">
                {formLevel}
              </span>
              <span className="text-[8px] font-black uppercase text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/10 font-mono">
                {formFocus}
              </span>
            </div>
          </div>
        </div>

        {/* Biometrics Slim Metadata Displays inside card Header */}
        <div className="grid grid-cols-2 gap-3.5 mt-3.5" id="profile-biometrics-readout">
          <div className="bg-black/40 border border-white/5 p-2 rounded-xl flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-[#FF5F00]">
              <span className="text-[9px] font-black italic">KG</span>
            </div>
            <div>
              <span className="text-[7.5px] text-white/40 uppercase block font-semibold leading-none">Massa corporal</span>
              <span className="text-xs font-black text-white mt-0.5 block font-mono">{athlete.weight} kg</span>
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 p-2 rounded-xl flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-[#FF5F00]">
              <span className="text-[9px] font-black italic">MT</span>
            </div>
            <div>
              <span className="text-[7.5px] text-white/40 uppercase block font-semibold leading-none">Estatura</span>
              <span className="text-xs font-black text-white mt-0.5 block font-mono">{athlete.height} m</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. CORE WORKOUT METADATA SUMMARY */}
      <div className="px-5 py-4 space-y-5" id="profile-main-stats">
        
        {/* Bento Stats row */}
        <div className="grid grid-cols-3 gap-3" id="profile-bento-row">
          <div className="bg-white/5 border border-white/[0.04] rounded-2xl p-3 text-center" id="stat-completed">
            <span className="text-[7.5px] uppercase font-bold text-white/40 tracking-wider block font-mono">Treinos Gravados</span>
            <span className="text-xl font-black text-white mt-0.5 block italic font-mono">{totalWorkouts}</span>
          </div>
          <div className="bg-white/5 border border-white/[0.04] rounded-2xl p-3 text-center" id="stat-minutes">
            <span className="text-[7.5px] uppercase font-bold text-white/40 tracking-wider block font-mono">Tempo Estético</span>
            <span className="text-xl font-black text-[#FF5F00] mt-0.5 block italic font-mono">{totalMinutes}m</span>
          </div>
          <div className="bg-white/5 border border-white/[0.04] rounded-2xl p-3 text-center" id="stat-sets">
            <span className="text-[7.5px] uppercase font-bold text-white/40 tracking-wider block font-mono">Séries Totais</span>
            <span className="text-xl font-black text-white mt-0.5 block italic font-mono">{totalSets}</span>
          </div>
        </div>

        {/* 3. GALERIA DE FOTOS DO SHAPE (Completed workout photo entries) */}
        <div className="space-y-3.5" id="workout-gallery-module">
          <div className="flex items-center justify-between" id="gallery-header-row">
            <h3 className="text-xs font-[950] text-white uppercase tracking-widest flex items-center gap-2 border-l-2 border-[#FF5F00] pl-2">
              <Camera className="w-3.5 h-3.5 text-[#FF5F00]" />
              FITA DE EVOLUÇÃO ESTÉTICA {(historyLogs.filter((l: any) => l.photo).length > 0) ? `(${historyLogs.filter((l: any) => l.photo).length})` : ''}
            </h3>
            <span className="text-[7px] text-white/30 uppercase tracking-widest font-mono">Checkpoints</span>
          </div>

          {/* Grid Layout containing Workout logs pictures */}
          {historyLogs.length === 0 ? (
            <div className="p-8 text-center bg-white/[0.02] border border-white/5 rounded-2xl space-y-2" id="gallery-empty-state">
              <ShieldAlert className="w-6 h-6 text-white/20 mx-auto" />
              <h4 className="text-xs font-black text-white/80 uppercase">Galeria evolutiva vazia</h4>
              <p className="text-[10px] text-white/40 max-w-xs mx-auto leading-relaxed">
                Tire uma foto ou use um plano estético predefinido ao finalizar seu treino na aba "Treinos". Elas serão exibidas aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3" id="evolving-checkpoints-photos-grid">
              {historyLogs.map((log: any) => {
                const dayName = new Date(log.date).toLocaleDateString('pt-BR', { weekday: 'short' });
                const splitTag = log.workoutTitle.split(' - ')[0] || 'Treino';

                return (
                  <div 
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="bg-zinc-950/60 rounded-xl border border-white/5 hover:border-[#FF5F00]/30 overflow-hidden relative cursor-pointer group hover:scale-[1.01] transition-all flex flex-col justify-between shadow-lg"
                    id={`evolution-photo-item-${log.id}`}
                  >
                    {/* Top corner badge split indicator */}
                    <div className="p-2 z-10 flex justify-between items-center bg-black/40 backdrop-blur-sm border-b border-white/5">
                      <span className="text-[8px] font-black text-[#FF5F00] uppercase tracking-wide">
                        {splitTag}
                      </span>
                      <span className="text-[7.5px] text-white/30 font-mono font-bold uppercase">
                        {dayName}
                      </span>
                    </div>

                    {/* Body Center: Graphic Selfie or Aesthetic placeholder */}
                    <div className="h-28 bg-[#0b0b0f] flex items-center justify-center relative overflow-hidden">
                      {log.photo ? (
                        <img 
                          src={log.photo} 
                          alt="Workout Checkpoint" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#121215] to-[#FF5F00]/5 flex flex-col items-center justify-center p-3 text-center space-y-1">
                          <Dumbbell className="w-5 h-5 text-white/20" />
                          <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest font-mono">Sem Foto</span>
                          <span className="text-[7px] text-[#FF5F00] italic font-semibold leading-none">Inserir fita estofada</span>
                        </div>
                      )}
                      {/* Dark shade indicator cover on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-[8px] font-black bg-[#FF5F00] text-black px-2 py-1 rounded uppercase tracking-wider italic">
                          VISUALIZAR FITA
                        </span>
                      </div>
                    </div>

                    {/* Bottom Metadata Summary strip */}
                    <div className="p-2 bg-[#0c0c10] border-t border-white/5 flex flex-col">
                      <span className="text-[9px] font-black text-white truncate max-w-full">
                        {log.workoutTitle.replace('Treino ', '')}
                      </span>
                      <div className="flex items-center justify-between text-[7.5px] text-white/40 font-semibold mt-1 font-mono">
                        <span>{log.durationMinutes} MIN</span>
                        <span>{log.setsCompletedCount} SÉRIES</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ==================== 4. EDIT PROFILE OVERLAY MODAL ==================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50" id="edit-profile-modal-overlay">
          <div className="bg-[#0c0c14] border border-white/10 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative" id="edit-profile-modal-card">
            <button
              id="close-edit-modal-btn"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-white uppercase italic tracking-tight font-sans">
              EDITAR <span className="text-[#FF5F00]">DADOS DO ATLETA</span>
            </h3>
            <p className="text-white/40 text-[10px] mt-0.5 italic">
              Atualize seu perfil. As mudanças refletem nas metas estéticas.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 mt-4" id="edit-profile-form">
              {/* Name */}
              <div id="form-group-name">
                <label className="text-[8px] uppercase font-black text-white/50 tracking-widest pl-1 font-mono block mb-1">
                  Nome Completo
                </label>
                <input 
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-black border border-white/10 focus:border-[#FF5F00] outline-none text-xs text-white px-3 py-2 rounded-xl pr bg-black/80 font-bold"
                />
              </div>

              {/* Weight & Height Row */}
              <div className="grid grid-cols-2 gap-3" id="form-group-row-biometrics">
                <div>
                  <label className="text-[8px] uppercase font-black text-white/50 tracking-widest pl-1 font-mono block mb-1">
                    Peso (kg)
                  </label>
                  <input 
                    type="number"
                    step="0.1"
                    required
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="w-full bg-black border border-white/10 focus:border-[#FF5F00] outline-none text-xs text-white px-3 py-2 rounded-xl font-black font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-[8px] uppercase font-black text-white/50 tracking-widest pl-1 font-mono block mb-1">
                    Altura (m)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={formHeight}
                    onChange={(e) => setFormHeight(e.target.value)}
                    className="w-full bg-black border border-white/10 focus:border-[#FF5F00] outline-none text-xs text-white px-3 py-2 rounded-xl font-black font-mono text-center"
                  />
                </div>
              </div>

              {/* Level & focus options dropdowns */}
              <div className="grid grid-cols-2 gap-3" id="form-group-row-details">
                <div>
                  <label className="text-[8px] uppercase font-black text-white/50 tracking-widest pl-1 font-mono block mb-1">
                    Nível do Atleta
                  </label>
                  <select 
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value)}
                    className="w-full bg-black border border-white/10 focus:border-[#FF5F00] outline-none text-[10px] text-white px-2.5 py-2 rounded-xl font-black uppercase text-center"
                  >
                    <option value="Apanhado">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                    <option value="Elite">Elite Brutal</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8px] uppercase font-black text-white/50 tracking-widest pl-1 font-mono block mb-1">
                    Foco Principal
                  </label>
                  <input 
                    type="text"
                    required
                    value={formFocus}
                    onChange={(e) => setFormFocus(e.target.value)}
                    className="w-full bg-black border border-white/10 focus:border-[#FF5F00] outline-none text-[10px] text-white px-2 py-2 rounded-xl font-bold uppercase text-center"
                  />
                </div>
              </div>

              {/* Save profile */}
              <button
                type="submit"
                id="btn-save-profile-action"
                className="w-full py-2.5 bg-[#FF5F00] hover:bg-[#FF8C00] text-black text-xs font-[900] rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wider italic mt-4 transition-all"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 5. HIGH FIDELITY SHARE CARD MODAL ==================== */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-50 overflow-y-auto" id="log-detail-modal">
          
          <div className="max-w-md w-full bg-[#030305] border border-white/15 rounded-[2.5rem] p-5 shadow-[0_0_50px_rgba(255,95,0,0.15)] relative overflow-hidden" id="log-detail-container">
            
            {/* Absolute close button */}
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/80 border border-white/15 text-white/60 hover:text-white"
              id="btn-close-gallery-detail-modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* STAGE CONTAINER TO GENERATE SHARE CARD */}
            <div 
              className="border border-white/10 rounded-3xl overflow-hidden bg-black relative flex flex-col justify-between" 
              id="aesthetic-share-card-canvas"
            >
              {/* Background cover / Photo */}
              <div className="h-80 bg-zinc-950 relative overflow-hidden" id="card-photo-stage">
                
                {selectedLog.photo ? (
                  <img 
                    src={selectedLog.photo} 
                    alt="Checkpoint Shape" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#121215] to-[#FF5F00]/10 flex flex-col items-center justify-center p-6 text-center">
                    <Dumbbell className="w-12 h-12 text-[#FF5F00]/30 animate-pulse mb-2" />
                    <span className="text-xs text-white/50 font-black uppercase tracking-widest font-mono">TATU GYM ECOSYSTEM</span>
                    <span className="text-[10px] text-white/30 italic font-semibold max-w-xs mt-1">
                      Check-point de cargas e fita de evolução muscular gravada.
                    </span>
                  </div>
                )}

                {/* Dark Gradient bottom overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-10" />

                {/* Aesthetic Top Branding inside story */}
                <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start" id="story-branding-bar">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#FF5F00] font-sans tracking-tight uppercase leading-none">
                      TATU GYM • COORDENADAS
                    </span>
                    <span className="text-[7px] text-white/50 font-mono tracking-widest uppercase block mt-1">
                      ESTÉTICA MASCULINA ABC
                    </span>
                  </div>
                  <span className="text-[8px] font-mono font-black italic text-black bg-[#FF5F00] px-2 py-0.5 rounded border border-[#FF5F00]/20">
                    AVANÇADO
                  </span>
                </div>

                {/* Overlaid stats directly over the photo bottom */}
                <div className="absolute bottom-4 left-4 right-4 z-20 space-y-2 text-left" id="story-overlaid-stats">
                  <div>
                    <span className="text-[9px] bg-[#FF5F00]/95 text-black font-black px-2 py-0.5 rounded uppercase font-mono italic">
                      {selectedLog.workoutTitle.split(' - ')[0] || 'SPLIT'} CONCLUÍDO
                    </span>
                    <h2 className="text-xl font-[950] text-white italic uppercase tracking-tight font-sans leading-tight mt-1.5 drop-shadow-md">
                      {selectedLog.workoutTitle.replace('Treino ', '')}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1" id="story-badge-strip">
                    <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#FF5F00]" />
                      <span className="text-[9px] font-black text-white font-mono">{selectedLog.durationMinutes} min</span>
                    </div>
                    <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                      <Dumbbell className="w-3 h-3 text-[#FF5F00]" />
                      <span className="text-[9px] font-black text-white font-mono">{selectedLog.setsCompletedCount} séries</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Card Area: Core Exercises details display */}
              <div className="p-4 bg-zinc-950 border-t border-white/10 space-y-3.5" id="card-foot-block">
                
                <div className="flex justify-between items-center" id="card-foot-metrics">
                  <div className="text-left">
                    <span className="text-[8px] uppercase tracking-widest text-white/40 block font-mono">Nome do Atleta</span>
                    <span className="text-xs font-black text-white uppercase italic tracking-wide mt-0.5 block">{athlete.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase tracking-widest text-white/40 block font-mono">Data do Registro</span>
                    <span className="text-[10px] font-bold text-white font-mono mt-0.5 block">{formatDisplayDate(selectedLog.date)}</span>
                  </div>
                </div>

                <div 
                  className="bg-black border border-white/5 rounded-xl p-3 space-y-2.5 text-left font-mono" 
                  id="card-exercises-logged"
                >
                  <span className="text-[7.5px] uppercase font-black text-[#FF5F00] tracking-widest block font-mono">
                    Registros de Cargas
                  </span>

                  <div className="space-y-1.5 divide-y divide-white/[0.03]" id="card-exercises-list">
                    {selectedLog.exercises.map((ex: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-[9px] py-1 text-white/80">
                        <span className="font-semibold truncate max-w-[190px] uppercase">{ex.name}</span>
                        <span className="font-bold text-white flex-shrink-0">carga máx: {ex.bestLoad}kg</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slogan print on the footer card */}
                <div className="text-center pt-1 flex justify-center items-center gap-1.5 text-[8.5px] text-white/20 uppercase font-black italic tracking-widest" id="card-motivational">
                  <Heart className="w-2.5 h-2.5 fill-[#FF5F00] text-transparent" />
                  MENTE BLINDADA, FIBRA ESTÉTICA
                </div>

              </div>

            </div>

            {/* Actions Footer inside detail modal */}
            <div className="flex justify-between gap-3 mt-4" id="log-detail-actions">
              <button
                id="btn-delete-log-action"
                onClick={() => {
                  if (window.confirm("Deseja mesmo excluir para sempre este checkpoint e sua foto?")) {
                    deleteHistoryLog(selectedLog.id);
                    setSelectedLog(null);
                  }
                }}
                className="px-3.5 py-2.5 border border-red-500/25 hover:bg-red-950/20 text-red-400 text-xs font-black rounded-xl uppercase transition-all flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                EXCLUIR
              </button>

              {selectedLog.photo ? (
                <button
                  id="btn-download-log-photo"
                  onClick={() => triggerCardDownload(selectedLog)}
                  className="flex-1 py-2.5 bg-[#FF5F00] hover:bg-[#FF8C00] text-black text-xs font-black rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wide transition-all italic"
                >
                  <Download className="w-4 h-4" />
                  Salvar na Galeria
                </button>
              ) : (
                <div className="text-[10px] text-white/40 italic flex-1 flex items-center justify-center font-semibold uppercase tracking-wider bg-white/5 border border-white/5 rounded-xl">
                  SEM FOTO PARA TRANSFERÊNCIA
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
