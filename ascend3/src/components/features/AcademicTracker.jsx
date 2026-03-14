import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { differenceInDays, parseISO } from 'date-fns';
import { HiPlus, HiTrash } from 'react-icons/hi2';

export default function AcademicTracker() {
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [showAddExam, setShowAddExam] = useState(false);
  const [newExam, setNewExam] = useState({ subject: '', name: '', date: '', importance: 'normal' });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const subDoc = await getDoc(doc(db, 'users', user.uid, 'academic', 'subjects'));
    if (subDoc.exists()) setSubjects(subDoc.data().list || []);
    const examDoc = await getDoc(doc(db, 'users', user.uid, 'academic', 'exams'));
    if (examDoc.exists()) setExams(examDoc.data().list || []);
  };

  const addSubject = async () => {
    if (!newSubject.trim() || !user) return;
    const updated = [...subjects, newSubject.trim()];
    setSubjects(updated);
    await setDoc(doc(db, 'users', user.uid, 'academic', 'subjects'), { list: updated });
    setNewSubject('');
  };

  const removeSubject = async (idx) => {
    const updated = subjects.filter((_, i) => i !== idx);
    setSubjects(updated);
    if (user) await setDoc(doc(db, 'users', user.uid, 'academic', 'subjects'), { list: updated });
  };

  const addExam = async () => {
    if (!newExam.subject || !newExam.name || !newExam.date || !user) return;
    const updated = [...exams, { ...newExam, id: Date.now() }];
    setExams(updated);
    await setDoc(doc(db, 'users', user.uid, 'academic', 'exams'), { list: updated });
    setShowAddExam(false);
    setNewExam({ subject: '', name: '', date: '', importance: 'normal' });
  };

  const removeExam = async (id) => {
    const updated = exams.filter((e) => e.id !== id);
    setExams(updated);
    if (user) await setDoc(doc(db, 'users', user.uid, 'academic', 'exams'), { list: updated });
  };

  const today = new Date();
  const upcomingExams = exams
    .filter((e) => parseISO(e.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const pastExams = exams
    .filter((e) => parseISO(e.date) < today);

  const importanceColors = {
    normal: 'border-accent/20',
    importante: 'border-gold/30 bg-gold/5',
    final: 'border-red/30 bg-red/5',
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Subjects */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-medium text-text-primary mb-2">📚 Materias</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {subjects.map((sub, i) => (
            <div key={i} className="flex items-center gap-1 bg-accent/10 rounded-lg px-2 py-1 text-xs text-accent">
              {sub}
              <button onClick={() => removeSubject(i)} className="text-red/50 hover:text-red ml-1">×</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Nombre de materia"
            className="text-sm flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addSubject()}
          />
          <button onClick={addSubject} className="btn-primary py-2 px-3 text-sm">
            <HiPlus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Upcoming Exams */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-primary">📝 Exámenes</h3>
          <button onClick={() => setShowAddExam(true)} className="text-xs text-accent">+ Agregar</button>
        </div>

        {upcomingExams.length > 0 ? (
          upcomingExams.map((exam) => {
            const daysLeft = differenceInDays(parseISO(exam.date), today);
            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-3 mb-2 border ${importanceColors[exam.importance]}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{exam.name}</p>
                    <p className="text-[10px] text-text-muted">{exam.subject} · {exam.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono font-bold ${daysLeft <= 3 ? 'text-red' : daysLeft <= 7 ? 'text-gold' : 'text-accent'}`}>
                      {daysLeft}d
                    </span>
                    <button onClick={() => removeExam(exam.id)} className="text-text-muted hover:text-red">
                      <HiTrash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="glass-card p-4 text-center">
            <p className="text-text-muted text-xs">Sin exámenes próximos</p>
          </div>
        )}
      </div>

      {/* Past exams */}
      {pastExams.length > 0 && (
        <div>
          <h4 className="text-xs text-text-muted mb-1">Exámenes pasados</h4>
          {pastExams.slice(0, 5).map((exam) => (
            <div key={exam.id} className="flex items-center justify-between py-1 text-xs opacity-50">
              <span className="text-text-secondary">{exam.name} ({exam.subject})</span>
              <span className="text-text-muted">{exam.date}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add Exam Modal */}
      <AnimatePresence>
        {showAddExam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAddExam(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-5 w-full max-w-md flex flex-col gap-3"
            >
              <h3 className="font-display text-lg font-bold">Nuevo Examen</h3>
              <select
                value={newExam.subject}
                onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
              >
                <option value="">Selecciona materia</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                type="text"
                value={newExam.name}
                onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                placeholder="Nombre del examen"
              />
              <input
                type="date"
                value={newExam.date}
                onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
              />
              <select
                value={newExam.importance}
                onChange={(e) => setNewExam({ ...newExam, importance: e.target.value })}
              >
                <option value="normal">Normal</option>
                <option value="importante">Importante</option>
                <option value="final">Final</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowAddExam(false)} className="flex-1 py-2 text-xs text-text-muted">Cancelar</button>
                <button onClick={addExam} className="flex-1 btn-primary text-xs py-2">Agregar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
