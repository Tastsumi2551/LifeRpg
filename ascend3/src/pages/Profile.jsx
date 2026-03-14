import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { useAuth } from '../lib/useAuth';
import { useNavigate } from 'react-router-dom';
import StepSchedule from '../components/onboarding/StepSchedule';
import StepMissions from '../components/onboarding/StepMissions';
import StepHealth from '../components/onboarding/StepHealth';
import XPBar from '../components/ui/XPBar';
import WeeklyReport from '../components/features/WeeklyReport';
import FinanceTracker from '../components/features/FinanceTracker';
import AcademicTracker from '../components/features/AcademicTracker';

export default function Profile() {
  const { profile, schedule, settings, stats, setProfile, updateSchedule, updateSettings, setSettings } = useGameStore();
  const { user, setOnboardingComplete } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(null);
  const [tempSchedule, setTempSchedule] = useState(schedule);
  const [tempHealth, setTempHealth] = useState(settings.healthGoals || {});
  const [tempMissions, setTempMissions] = useState({
    activeMissions: settings.activeMissions || [],
    customMissions: settings.customMissions || [],
  });
  const [editName, setEditName] = useState(profile.displayName);

  const handleLogout = async () => {
    await logout();
    useGameStore.setState({ loaded: false, profile: { ...useGameStore.getState().profile, level: 1, xp: 0 } });
    navigate('/login', { replace: true });
  };

  const saveSchedule = () => {
    updateSchedule(tempSchedule);
    setEditMode(null);
  };

  const saveHealth = () => {
    updateSettings({ healthGoals: tempHealth });
    setEditMode(null);
  };

  const saveMissions = () => {
    updateSettings({
      activeMissions: tempMissions.activeMissions,
      customMissions: tempMissions.customMissions,
    });
    setEditMode(null);
  };

  const saveName = () => {
    setProfile({ displayName: editName });
    useGameStore.getState().debouncedSync();
    setEditMode(null);
  };

  const toggleModule = (mod) => {
    const modules = { ...settings.modules, [mod]: !settings.modules?.[mod] };
    updateSettings({ modules });
  };

  const repeatOnboarding = () => {
    setOnboardingComplete(false);
    navigate('/onboarding', { replace: true });
  };

  if (editMode === 'schedule') {
    return (
      <div className="p-4">
        <button onClick={() => setEditMode(null)} className="text-sm text-text-muted mb-3">← Volver</button>
        <StepSchedule data={tempSchedule} onChange={setTempSchedule} />
        <button onClick={saveSchedule} className="btn-primary w-full mt-4">Guardar horario</button>
      </div>
    );
  }

  if (editMode === 'health') {
    return (
      <div className="p-4">
        <button onClick={() => setEditMode(null)} className="text-sm text-text-muted mb-3">← Volver</button>
        <StepHealth data={tempHealth} onChange={setTempHealth} />
        <button onClick={saveHealth} className="btn-primary w-full mt-4">Guardar metas</button>
      </div>
    );
  }

  if (editMode === 'missions') {
    return (
      <div className="p-4">
        <button onClick={() => setEditMode(null)} className="text-sm text-text-muted mb-3">← Volver</button>
        <StepMissions data={tempMissions} onChange={setTempMissions} schedule={schedule} health={settings.healthGoals} />
        <button onClick={saveMissions} className="btn-primary w-full mt-4">Guardar misiones</button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-6 flex flex-col gap-4">
      {/* Profile Card */}
      <div className="glass-card p-4 flex flex-col items-center gap-3">
        <span className="text-5xl">{profile.avatar}</span>
        {editMode === 'name' ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-sm text-center"
            />
            <button onClick={saveName} className="text-accent text-xs">✓</button>
          </div>
        ) : (
          <button onClick={() => setEditMode('name')} className="text-lg font-medium text-text-primary hover:text-accent transition-colors">
            {profile.displayName || 'Aventurero'}
          </button>
        )}
        <XPBar level={profile.level} xp={profile.xp} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Nivel', value: profile.level, icon: '⭐' },
          { label: 'XP Total', value: profile.totalXp, icon: '⚡' },
          { label: 'Racha actual', value: profile.streak, icon: '🔥' },
          { label: 'Racha máxima', value: stats.maxStreak, icon: '🏆' },
          { label: 'Misiones', value: stats.missionsCompleted, icon: '⚔️' },
          { label: 'Días activos', value: stats.daysActive, icon: '📅' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-3 text-center">
            <span className="text-lg">{stat.icon}</span>
            <p className="text-lg font-mono font-bold text-text-primary">{stat.value}</p>
            <p className="text-[10px] text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="glass-card p-4 flex flex-col gap-3">
        <h3 className="text-sm font-display font-bold text-text-primary">⚙️ Configuración</h3>

        <button onClick={() => { setTempSchedule(schedule); setEditMode('schedule'); }} className="flex items-center justify-between py-2 text-sm text-text-secondary hover:text-accent transition-colors">
          <span>📅 Editar horario</span>
          <span className="text-text-muted">→</span>
        </button>

        <button onClick={() => { setTempMissions({ activeMissions: settings.activeMissions || [], customMissions: settings.customMissions || [] }); setEditMode('missions'); }} className="flex items-center justify-between py-2 text-sm text-text-secondary hover:text-accent transition-colors">
          <span>⚔️ Editar misiones auto</span>
          <span className="text-text-muted">→</span>
        </button>

        <button onClick={() => { setTempHealth(settings.healthGoals || {}); setEditMode('health'); }} className="flex items-center justify-between py-2 text-sm text-text-secondary hover:text-accent transition-colors">
          <span>❤️ Metas de salud</span>
          <span className="text-text-muted">→</span>
        </button>

        {/* Module toggles */}
        <div className="border-t border-border pt-3 mt-1">
          <p className="text-xs text-text-muted mb-2">Módulos</p>
          {[
            { key: 'gym', label: '🏋️ Gym', desc: 'Tracker de entrenamientos' },
            { key: 'finance', label: '💰 Finanzas', desc: 'Control de gastos' },
            { key: 'academic', label: '📚 Academia', desc: 'Tracker académico' },
          ].map((mod) => (
            <div key={mod.key} className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm text-text-secondary">{mod.label}</span>
                <p className="text-[10px] text-text-muted">{mod.desc}</p>
              </div>
              <div
                onClick={() => toggleModule(mod.key)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  settings.modules?.[mod.key] ? 'bg-accent' : 'bg-bg-deep'
                }`}
              >
                <motion.div
                  className="w-4 h-4 bg-white rounded-full absolute top-0.5"
                  animate={{ left: settings.modules?.[mod.key] ? 22 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Units */}
        <div className="flex items-center justify-between py-2 border-t border-border">
          <span className="text-sm text-text-secondary">⚖️ Unidades</span>
          <div className="flex gap-1">
            {['kg', 'lb'].map((u) => (
              <button
                key={u}
                onClick={() => updateSettings({ units: u })}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${
                  settings.units === u ? 'bg-accent text-white' : 'bg-bg-surface text-text-muted'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Report */}
      <WeeklyReport />

      {/* Finance Module */}
      {settings.modules?.finance && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-display font-bold text-text-primary mb-3">💰 Finanzas</h3>
          <FinanceTracker />
        </div>
      )}

      {/* Academic Module */}
      {settings.modules?.academic && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-display font-bold text-text-primary mb-3">📚 Academia</h3>
          <AcademicTracker />
        </div>
      )}

      {/* Actions */}
      <button
        onClick={repeatOnboarding}
        className="text-sm text-text-muted hover:text-accent transition-colors py-2"
      >
        🔄 Repetir onboarding
      </button>

      <button
        onClick={handleLogout}
        className="text-sm text-red hover:text-red/80 transition-colors py-2"
      >
        Cerrar sesión
      </button>

      <p className="text-center text-text-muted text-[10px] mt-2">
        Ascend v3.0 — por Tastsumi
      </p>
    </div>
  );
}
