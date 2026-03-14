import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi2';

const defaultItems = [
  { name: '1 hora de videojuegos', price: 50, emoji: '🎮', category: 'entretenimiento' },
  { name: 'Comida chatarra permitida', price: 30, emoji: '🍕', category: 'comida' },
  { name: 'Día libre sin misiones', price: 100, emoji: '🏖️', category: 'caprichos' },
  { name: 'Compra personal', price: 200, emoji: '🛍️', category: 'caprichos' },
  { name: 'Maratón de series', price: 80, emoji: '📺', category: 'entretenimiento' },
  { name: 'Salir con amigos', price: 40, emoji: '👥', category: 'entretenimiento' },
];

const categories = [
  { value: 'todos', label: '📦 Todos' },
  { value: 'entretenimiento', label: '🎮 Entretenim.' },
  { value: 'comida', label: '🍕 Comida' },
  { value: 'caprichos', label: '🎁 Caprichos' },
  { value: 'powerups', label: '⚡ Power-ups' },
];

export default function Shop() {
  const { profile, spendCoins } = useGameStore();
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('todos');
  const [showCreate, setShowCreate] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: 50, emoji: '🎁', category: 'caprichos', description: '' });
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [confirmBuy, setConfirmBuy] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) loadShop();
  }, [user]);

  const loadShop = async () => {
    if (!user) return;
    const shopDoc = await getDoc(doc(db, 'users', user.uid, 'shop', 'items'));
    if (shopDoc.exists()) {
      setItems(shopDoc.data().items || []);
    } else {
      setItems(defaultItems);
      await setDoc(doc(db, 'users', user.uid, 'shop', 'items'), { items: defaultItems });
    }

    const histDoc = await getDoc(doc(db, 'users', user.uid, 'shop', 'history'));
    if (histDoc.exists()) setPurchaseHistory(histDoc.data().purchases || []);
  };

  const saveItems = async (updated) => {
    setItems(updated);
    if (user) await setDoc(doc(db, 'users', user.uid, 'shop', 'items'), { items: updated });
  };

  const buyItem = async (item) => {
    const success = spendCoins(item.price);
    if (!success) return;

    const purchase = { ...item, boughtAt: new Date().toISOString() };
    const updated = [purchase, ...purchaseHistory];
    setPurchaseHistory(updated);
    if (user) await setDoc(doc(db, 'users', user.uid, 'shop', 'history'), { purchases: updated });
    setConfirmBuy(null);
  };

  const createItem = async () => {
    if (!newItem.name.trim()) return;
    let updated;
    if (editingIdx !== null) {
      updated = [...items];
      updated[editingIdx] = { ...newItem };
    } else {
      updated = [...items, { ...newItem }];
    }
    await saveItems(updated);
    setShowCreate(false);
    setEditingIdx(null);
    setNewItem({ name: '', price: 50, emoji: '🎁', category: 'caprichos', description: '' });
  };

  const deleteItem = async (idx) => {
    const updated = items.filter((_, i) => i !== idx);
    await saveItems(updated);
  };

  const editItem = (idx) => {
    setNewItem(items[idx]);
    setEditingIdx(idx);
    setShowCreate(true);
  };

  const filtered = category === 'todos' ? items : items.filter((i) => i.category === category);

  return (
    <div className="p-4 pb-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-text-primary">Tienda</h1>
          <p className="text-xs text-text-muted">Canjea tus coins por recompensas</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gold font-mono font-semibold">🪙 {profile.coins}</span>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-xs py-1.5 px-2">
            <HiPlus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              category === cat.value ? 'bg-accent text-white' : 'bg-bg-surface text-text-muted'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item, i) => {
            const canAfford = profile.coins >= item.price;
            return (
              <motion.div
                key={i}
                whileTap={{ scale: 0.97 }}
                className="glass-card p-3 flex flex-col gap-2 relative group"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => editItem(items.indexOf(item))} className="text-text-muted hover:text-accent p-0.5">
                    <HiPencil className="w-3 h-3" />
                  </button>
                  <button onClick={() => deleteItem(items.indexOf(item))} className="text-text-muted hover:text-red p-0.5">
                    <HiTrash className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-3xl">{item.emoji}</span>
                <span className="text-xs font-medium text-text-primary">{item.name}</span>
                {item.description && <span className="text-[10px] text-text-muted">{item.description}</span>}
                <button
                  onClick={() => canAfford && setConfirmBuy(item)}
                  disabled={!canAfford}
                  className={`mt-auto py-1.5 rounded-lg text-xs font-medium transition-all ${
                    canAfford
                      ? 'bg-gold/10 text-gold hover:bg-gold/20'
                      : 'bg-bg-deep text-text-muted cursor-not-allowed'
                  }`}
                >
                  🪙 {item.price}
                </button>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-6 text-center">
          <span className="text-3xl mb-2 block">🎁</span>
          <p className="text-text-secondary text-sm">¡Crea tu primera recompensa!</p>
          <p className="text-text-muted text-xs mt-1">Define qué te puedes ganar con tus coins</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-xs py-2 px-4 mt-3">
            Crear recompensa
          </button>
        </div>
      )}

      {/* History */}
      {purchaseHistory.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            {showHistory ? '▼' : '▶'} Historial de canjes ({purchaseHistory.length})
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-col gap-1 mt-2 overflow-hidden"
              >
                {purchaseHistory.slice(0, 20).map((p, i) => (
                  <div key={i} className="flex justify-between text-xs bg-bg-surface rounded-lg p-2">
                    <span className="text-text-secondary">{p.emoji} {p.name}</span>
                    <span className="text-text-muted">{new Date(p.boughtAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Confirm Purchase */}
      <AnimatePresence>
        {confirmBuy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmBuy(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-5 text-center max-w-xs"
            >
              <span className="text-5xl mb-3 block">{confirmBuy.emoji}</span>
              <p className="text-sm font-medium text-text-primary mb-1">{confirmBuy.name}</p>
              <p className="text-xs text-text-muted mb-4">¿Canjear por {confirmBuy.price} coins?</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmBuy(null)} className="flex-1 py-2 text-xs text-text-muted rounded-xl hover:bg-bg-surface">
                  Cancelar
                </button>
                <button onClick={() => buyItem(confirmBuy)} className="flex-1 btn-primary text-xs py-2">
                  🪙 Canjear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => { setShowCreate(false); setEditingIdx(null); }}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-5 w-full max-w-md flex flex-col gap-3"
            >
              <h3 className="font-display text-lg font-bold">
                {editingIdx !== null ? 'Editar' : 'Nueva'} Recompensa
              </h3>
              <div className="flex gap-2 items-end">
                <div className="flex-shrink-0">
                  <label className="text-[10px] text-text-muted mb-1 block">Emoji</label>
                  <input
                    type="text"
                    value={newItem.emoji}
                    onChange={(e) => setNewItem({ ...newItem, emoji: e.target.value })}
                    className="w-14 text-center text-2xl"
                    maxLength={4}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-text-muted mb-1 block">Nombre</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Nombre"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Precio (coins)</label>
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Math.max(1, parseInt(e.target.value) || 1) })}
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Categoría</label>
                  <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                    <option value="entretenimiento">🎮 Entretenimiento</option>
                    <option value="comida">🍕 Comida</option>
                    <option value="caprichos">🎁 Caprichos</option>
                    <option value="powerups">⚡ Power-ups</option>
                  </select>
                </div>
              </div>
              <input
                type="text"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Descripción (opcional)"
              />
              <div className="flex gap-2">
                <button onClick={() => { setShowCreate(false); setEditingIdx(null); }} className="flex-1 py-2 text-xs text-text-muted">
                  Cancelar
                </button>
                <button onClick={createItem} className="flex-1 btn-primary text-xs py-2">
                  {editingIdx !== null ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
