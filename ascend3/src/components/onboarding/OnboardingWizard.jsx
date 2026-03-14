import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../stores/authStore';
import { useGameStore } from '../../stores/gameStore';
import StepProfile from './StepProfile';
import StepSchedule from './StepSchedule';
import StepHealth from './StepHealth';
import StepMissions from './StepMissions';
import StepAxel from './StepAxel';

const steps = ['Perfil', 'Horario', 'Salud', 'Misiones', 'Axel'];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { user, setOnboardingComplete } = useAuthStore();
  const { setProfile, setSchedule, setSettings } = useGameStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    avatar: '🧑‍💻',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [scheduleData, setScheduleData] = useState(() => {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const schedule = {};
    days.forEach((day, i) => {
      schedule[day] = {
        active: i < 5,
        wakeUp: '07:00',
        sleep: '23:00',
        blocks: [],
      };
    });
    return schedule;
  });

  const [healthData, setHealthData] = useState({
    goesToGym: false,
    gymDays: 3,
    gymPreference: 'tarde',
    calorieGoal: 2000,
    proteinGoal: 150,
    waterGoal: 8,
    currentWeight: '',
    goalWeight: '',
  });

  const [missionsData, setMissionsData] = useState({
    activeMissions: [],
    customMissions: [],
  });

  const next = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const back = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const skip = () => next();

  const finish = async () => {
    if (!user || saving) return;
    setSaving(true);

    try {
      const uid = user.uid;

      const profile = {
        displayName: profileData.displayName,
        avatar: profileData.avatar,
        timezone: profileData.timezone,
        level: 1,
        xp: 0,
        totalXp: 0,
        coins: 0,
        streak: 0,
        onboardingComplete: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const settings = {
        healthGoals: {
          goesToGym: healthData.goesToGym,
          gymDays: healthData.gymDays,
          gymPreference: healthData.gymPreference,
          calorieGoal: healthData.calorieGoal,
          proteinGoal: healthData.proteinGoal,
          waterGoal: healthData.waterGoal,
          currentWeight: healthData.currentWeight,
          goalWeight: healthData.goalWeight,
        },
        activeMissions: missionsData.activeMissions,
        customMissions: missionsData.customMissions,
        notifications: true,
        sounds: true,
        units: 'kg',
        modules: {
          gym: healthData.goesToGym,
          finance: false,
          academic: false,
        },
      };

      await Promise.all([
        setDoc(doc(db, 'users', uid, 'profile', 'data'), profile),
        setDoc(doc(db, 'users', uid, 'schedule', 'data'), scheduleData),
        setDoc(doc(db, 'users', uid, 'settings', 'data'), settings),
        setDoc(doc(db, 'users', uid, 'stats', 'data'), {
          missionsCompleted: 0,
          totalXpEarned: 0,
          maxStreak: 0,
          daysActive: 0,
        }),
      ]);

      setProfile(profile);
      setSchedule(scheduleData);
      setSettings(settings);
      setOnboardingComplete(true);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Error saving onboarding:', err);
      setSaving(false);
    }
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const stepComponents = [
    <StepProfile key="profile" data={profileData} onChange={setProfileData} />,
    <StepSchedule key="schedule" data={scheduleData} onChange={setScheduleData} />,
    <StepHealth key="health" data={healthData} onChange={setHealthData} />,
    <StepMissions key="missions" data={missionsData} onChange={setMissionsData} schedule={scheduleData} health={healthData} />,
    <StepAxel key="axel" name={profileData.displayName} />,
  ];

  return (
    <div className="h-full flex flex-col bg-bg-deep relative z-10">
      {/* Progress */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-muted text-xs font-mono">{currentStep + 1}/{steps.length}</span>
          <span className="text-text-secondary text-sm font-medium">{steps[currentStep]}</span>
        </div>
        <div className="w-full h-1.5 bg-bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-accent2 rounded-full"
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {stepComponents[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-border bg-bg-surface/50">
        <div>
          {currentStep > 0 && (
            <button onClick={back} className="text-text-muted hover:text-text-primary text-sm transition-colors">
              ← Atrás
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {currentStep < steps.length - 1 && (
            <>
              <button onClick={skip} className="text-text-muted hover:text-text-secondary text-xs transition-colors">
                Saltar
              </button>
              <button onClick={next} className="btn-primary text-sm py-2 px-6">
                Siguiente →
              </button>
            </>
          )}
          {currentStep === steps.length - 1 && (
            <button
              onClick={finish}
              disabled={saving}
              className="btn-primary text-sm py-2 px-6 flex items-center gap-2"
            >
              {saving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                '¡Empezar mi aventura! 🚀'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
