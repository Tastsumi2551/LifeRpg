import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import HydrationTracker from '../components/features/HydrationTracker';
import { HiPlus, HiMagnifyingGlass, HiStar, HiTrash } from 'react-icons/hi2';

const mealTypes = ['Desayuno', 'Almuerzo', 'Cena', 'Snacks'];

export default function Nutrition() {
  const { settings } = useGameStore();
  const { user } = useAuthStore();
  const [meals, setMeals] = useState({});
  const [showAdd, setShowAdd] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualFood, setManualFood] = useState({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, servings: 1 });
  const [recentFoods, setRecentFoods] = useState([]);
  const [savedFoods, setSavedFoods] = useState([]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const goals = settings?.healthGoals || {};
  const calorieGoal = goals.calorieGoal || 2000;
  const proteinGoal = goals.proteinGoal || 150;

  useEffect(() => {
    if (user) loadMeals();
  }, [user]);

  const loadMeals = async () => {
    if (!user) return;
    const mealDoc = await getDoc(doc(db, 'users', user.uid, 'nutrition', today));
    if (mealDoc.exists()) setMeals(mealDoc.data().meals || {});

    const savedDoc = await getDoc(doc(db, 'users', user.uid, 'nutrition', 'saved'));
    if (savedDoc.exists()) {
      setRecentFoods(savedDoc.data().recent || []);
      setSavedFoods(savedDoc.data().favorites || []);
    }
  };

  const saveMeals = async (updatedMeals) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'nutrition', today), { meals: updatedMeals, date: today });
  };

  const searchFood = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchTerm)}&json=1&page_size=10`
      );
      const data = await res.json();
      const results = (data.products || []).map((p) => ({
        name: p.product_name || 'Sin nombre',
        calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
        protein: Math.round(p.nutriments?.proteins_100g || 0),
        carbs: Math.round(p.nutriments?.carbohydrates_100g || 0),
        fat: Math.round(p.nutriments?.fat_100g || 0),
        per100g: true,
      }));
      setSearchResults(results.filter((r) => r.name !== 'Sin nombre'));
    } catch {
      setSearchError('No se pudo conectar con Open Food Facts. Intenta agregar manualmente.');
      setSearchResults([]);
    }
    setSearching(false);
  };

  const addFood = async (food, mealType) => {
    const updatedMeals = { ...meals };
    if (!updatedMeals[mealType]) updatedMeals[mealType] = [];
    updatedMeals[mealType].push({
      ...food,
      addedAt: new Date().toISOString(),
    });
    setMeals(updatedMeals);
    await saveMeals(updatedMeals);

    // Update recent
    const updated = [food, ...recentFoods.filter((f) => f.name !== food.name)].slice(0, 10);
    setRecentFoods(updated);
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'nutrition', 'saved'), { recent: updated, favorites: savedFoods }, { merge: true });
    }

    setShowAdd(null);
    setSearchTerm('');
    setSearchResults([]);
    setManualMode(false);
    setManualFood({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, servings: 1 });
  };

  const removeFood = async (mealType, index) => {
    const updatedMeals = { ...meals };
    updatedMeals[mealType] = updatedMeals[mealType].filter((_, i) => i !== index);
    setMeals(updatedMeals);
    await saveMeals(updatedMeals);
  };

  const saveToFavorites = async (food) => {
    const updated = [...savedFoods.filter((f) => f.name !== food.name), food];
    setSavedFoods(updated);
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'nutrition', 'saved'), { recent: recentFoods, favorites: updated }, { merge: true });
    }
  };

  // Totals
  const allFoods = Object.values(meals).flat();
  const totalCalories = allFoods.reduce((s, f) => s + (f.calories || 0), 0);
  const totalProtein = allFoods.reduce((s, f) => s + (f.protein || 0), 0);
  const totalCarbs = allFoods.reduce((s, f) => s + (f.carbs || 0), 0);
  const totalFat = allFoods.reduce((s, f) => s + (f.fat || 0), 0);

  const calPercent = Math.min((totalCalories / calorieGoal) * 100, 100);
  const protPercent = Math.min((totalProtein / proteinGoal) * 100, 100);

  return (
    <div className="p-4 pb-6 flex flex-col gap-4">
      <h1 className="font-display text-lg font-bold text-text-primary">Nutrición</h1>

      {/* Summary */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto">
              <svg className="w-20 h-20 -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none" stroke="url(#calGrad)" strokeWidth="6"
                  strokeDasharray={`${calPercent * 2.136} 213.6`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="calGrad">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-mono font-bold text-text-primary">{totalCalories}</span>
                <span className="text-[9px] text-text-muted">/{calorieGoal}</span>
              </div>
            </div>
            <span className="text-xs text-text-muted mt-1">Calorías</span>
          </div>
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto">
              <svg className="w-20 h-20 -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(16,185,129,0.1)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none" stroke="#10b981" strokeWidth="6"
                  strokeDasharray={`${protPercent * 2.136} 213.6`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-mono font-bold text-text-primary">{totalProtein}g</span>
                <span className="text-[9px] text-text-muted">/{proteinGoal}g</span>
              </div>
            </div>
            <span className="text-xs text-text-muted mt-1">Proteína</span>
          </div>
        </div>
        <div className="flex justify-center gap-6 mt-3 text-xs text-text-muted">
          <span>Carbs: {totalCarbs}g</span>
          <span>Grasa: {totalFat}g</span>
        </div>
      </div>

      {/* Hydration */}
      <HydrationTracker />

      {/* Meals */}
      {mealTypes.map((type) => (
        <div key={type} className="glass-card p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-text-primary">{type}</h3>
            <button
              onClick={() => setShowAdd(type)}
              className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center hover:bg-accent/20 transition-colors"
            >
              <HiPlus className="w-3 h-3" />
            </button>
          </div>
          {meals[type]?.length > 0 ? (
            meals[type].map((food, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-t border-border/50 text-xs">
                <span className="text-text-secondary flex-1 truncate">{food.name}</span>
                <div className="flex items-center gap-3 text-text-muted">
                  <span>{food.calories} kcal</span>
                  <span className="text-green">{food.protein}g P</span>
                  <button onClick={() => removeFood(type, i)} className="text-red/50 hover:text-red">
                    <HiTrash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-text-muted">Sin comidas registradas</p>
          )}
        </div>
      ))}

      {/* Add Food Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => { setShowAdd(null); setManualMode(false); }}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-5 w-full max-w-md flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
            >
              <h3 className="font-display text-lg font-bold">Agregar a {showAdd}</h3>

              <div className="flex gap-2">
                <button
                  onClick={() => setManualMode(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium ${!manualMode ? 'bg-accent text-white' : 'bg-bg-surface text-text-muted'}`}
                >
                  🔍 Buscar
                </button>
                <button
                  onClick={() => setManualMode(true)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium ${manualMode ? 'bg-accent text-white' : 'bg-bg-surface text-text-muted'}`}
                >
                  ✏️ Manual
                </button>
              </div>

              {!manualMode ? (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar comida..."
                      onKeyDown={(e) => e.key === 'Enter' && searchFood()}
                    />
                    <button onClick={searchFood} disabled={searching} className="btn-primary py-2 px-3">
                      <HiMagnifyingGlass className="w-4 h-4" />
                    </button>
                  </div>

                  {searchError && <p className="text-xs text-gold bg-gold/10 rounded-lg p-2">{searchError}</p>}

                  {searching && <div className="skeleton h-20" />}

                  {searchResults.map((food, i) => (
                    <button
                      key={i}
                      onClick={() => addFood(food, showAdd)}
                      className="flex items-center justify-between p-2 rounded-lg bg-bg-surface hover:bg-bg-card transition-colors text-left"
                    >
                      <div>
                        <p className="text-xs font-medium text-text-primary truncate">{food.name}</p>
                        <p className="text-[10px] text-text-muted">per 100g</p>
                      </div>
                      <div className="text-[10px] text-right text-text-muted">
                        <div>{food.calories} kcal</div>
                        <div className="text-green">P:{food.protein}g</div>
                      </div>
                    </button>
                  ))}

                  {/* Recent */}
                  {recentFoods.length > 0 && (
                    <div>
                      <p className="text-xs text-text-muted mb-1">Recientes</p>
                      {recentFoods.slice(0, 5).map((food, i) => (
                        <button
                          key={i}
                          onClick={() => addFood(food, showAdd)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-bg-surface transition-colors text-left"
                        >
                          <span className="text-xs text-text-secondary">{food.name}</span>
                          <span className="text-[10px] text-text-muted">{food.calories} kcal</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Saved */}
                  {savedFoods.length > 0 && (
                    <div>
                      <p className="text-xs text-text-muted mb-1">⭐ Guardadas</p>
                      {savedFoods.map((food, i) => (
                        <button
                          key={i}
                          onClick={() => addFood(food, showAdd)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-bg-surface transition-colors text-left"
                        >
                          <span className="text-xs text-text-secondary">{food.name}</span>
                          <span className="text-[10px] text-text-muted">{food.calories} kcal</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={manualFood.name}
                    onChange={(e) => setManualFood({ ...manualFood, name: e.target.value })}
                    placeholder="Nombre de la comida"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-text-muted">Calorías</label>
                      <input
                        type="number"
                        value={manualFood.calories}
                        onChange={(e) => setManualFood({ ...manualFood, calories: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted">Proteína (g)</label>
                      <input
                        type="number"
                        value={manualFood.protein}
                        onChange={(e) => setManualFood({ ...manualFood, protein: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted">Carbs (g)</label>
                      <input
                        type="number"
                        value={manualFood.carbs}
                        onChange={(e) => setManualFood({ ...manualFood, carbs: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-muted">Grasa (g)</label>
                      <input
                        type="number"
                        value={manualFood.fat}
                        onChange={(e) => setManualFood({ ...manualFood, fat: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setManualMode(false)} className="flex-1 py-2 text-xs text-text-muted">Cancelar</button>
                    <button
                      onClick={() => manualFood.name && addFood(manualFood, showAdd)}
                      className="flex-1 btn-primary text-xs py-2"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
