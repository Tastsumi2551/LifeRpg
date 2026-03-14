import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useGameStore } from '../../stores/gameStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';
import { HiPlus, HiTrash } from 'react-icons/hi2';

const expenseCategories = [
  { value: 'comida', icon: '🍔', label: 'Comida' },
  { value: 'transporte', icon: '🚌', label: 'Transporte' },
  { value: 'educación', icon: '📚', label: 'Educación' },
  { value: 'entretenimiento', icon: '🎮', label: 'Entretenimiento' },
  { value: 'vivienda', icon: '🏠', label: 'Vivienda' },
  { value: 'salud', icon: '💊', label: 'Salud' },
  { value: 'tech', icon: '📱', label: 'Tech' },
  { value: 'otros', icon: '🔧', label: 'Otros' },
];

const incomeSources = ['Trabajo', 'Freelance', 'Mesada', 'Otro'];
const currencies = ['RD$', 'USD', 'EUR', 'MXN', 'COP', 'ARS', 'CLP', 'PEN'];

export default function FinanceTracker() {
  const { user } = useAuthStore();
  const { settings, updateSettings } = useGameStore();
  const [transactions, setTransactions] = useState([]);
  const [showAdd, setShowAdd] = useState(null); // 'expense' | 'income'
  const [currency, setCurrency] = useState(settings?.financeCurrency || 'USD');
  const [savingsGoal, setSavingsGoal] = useState(settings?.savingsGoal || 0);
  const [newTx, setNewTx] = useState({ amount: '', category: 'comida', note: '', source: 'Trabajo' });

  const currentMonth = format(new Date(), 'yyyy-MM');

  useEffect(() => {
    if (user) loadTransactions();
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    const txDoc = await getDoc(doc(db, 'users', user.uid, 'finance', currentMonth));
    if (txDoc.exists()) setTransactions(txDoc.data().transactions || []);
  };

  const saveTransactions = async (updated) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'finance', currentMonth), { transactions: updated, month: currentMonth });
  };

  const addTransaction = async () => {
    const amount = parseFloat(newTx.amount);
    if (!amount || amount <= 0) return;

    const tx = {
      type: showAdd,
      amount,
      category: showAdd === 'expense' ? newTx.category : null,
      source: showAdd === 'income' ? newTx.source : null,
      note: newTx.note,
      date: new Date().toISOString(),
    };

    const updated = [tx, ...transactions];
    setTransactions(updated);
    await saveTransactions(updated);
    setShowAdd(null);
    setNewTx({ amount: '', category: 'comida', note: '', source: 'Trabajo' });
  };

  const removeTransaction = async (idx) => {
    const updated = transactions.filter((_, i) => i !== idx);
    setTransactions(updated);
    await saveTransactions(updated);
  };

  const saveCurrency = (cur) => {
    setCurrency(cur);
    updateSettings({ financeCurrency: cur });
  };

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Expense breakdown by category
  const byCategory = {};
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Currency selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {currencies.map((c) => (
          <button
            key={c}
            onClick={() => saveCurrency(c)}
            className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs ${
              currency === c ? 'bg-accent text-white' : 'bg-bg-surface text-text-muted'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-text-muted">Ingresos</p>
          <p className="text-sm font-mono font-bold text-green">{currency}{totalIncome.toLocaleString()}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-text-muted">Gastos</p>
          <p className="text-sm font-mono font-bold text-red">{currency}{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] text-text-muted">Balance</p>
          <p className={`text-sm font-mono font-bold ${balance >= 0 ? 'text-green' : 'text-red'}`}>
            {currency}{balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => setShowAdd('expense')} className="flex-1 py-2 rounded-xl bg-red/10 text-red text-sm font-medium">
          - Gasto
        </button>
        <button onClick={() => setShowAdd('income')} className="flex-1 py-2 rounded-xl bg-green/10 text-green text-sm font-medium">
          + Ingreso
        </button>
      </div>

      {/* Expense breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <div className="glass-card p-3">
          <h4 className="text-xs text-text-muted mb-2">Gastos por categoría</h4>
          {Object.entries(byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amount]) => {
              const catInfo = expenseCategories.find((c) => c.value === cat);
              const percent = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              return (
                <div key={cat} className="flex items-center gap-2 py-1">
                  <span className="text-sm w-5">{catInfo?.icon || '📦'}</span>
                  <span className="text-xs text-text-secondary flex-1">{catInfo?.label || cat}</span>
                  <span className="text-xs font-mono text-text-muted">{currency}{amount.toLocaleString()}</span>
                  <div className="w-16 h-1.5 bg-bg-deep rounded-full overflow-hidden">
                    <div className="h-full bg-red/60 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Savings goal */}
      {savingsGoal > 0 && (
        <div className="glass-card p-3">
          <h4 className="text-xs text-text-muted mb-1">🎯 Meta de ahorro</h4>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-secondary">{currency}{Math.max(0, balance).toLocaleString()}</span>
            <span className="text-text-muted">{currency}{savingsGoal.toLocaleString()}</span>
          </div>
          <div className="w-full h-2 bg-bg-deep rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-green rounded-full"
              style={{ width: `${Math.min((Math.max(0, balance) / savingsGoal) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div>
        <h4 className="text-xs text-text-muted mb-2">Movimientos recientes</h4>
        {transactions.length === 0 ? (
          <div className="text-center py-4">
            <span className="text-3xl block mb-2">💰</span>
            <p className="text-text-muted text-xs">Registra tu primer movimiento</p>
          </div>
        ) : (
          transactions.slice(0, 15).map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 text-xs">
              <div className="flex items-center gap-2">
                <span>{tx.type === 'expense' ? expenseCategories.find((c) => c.value === tx.category)?.icon || '📦' : '💵'}</span>
                <div>
                  <span className="text-text-secondary">{tx.note || (tx.type === 'expense' ? tx.category : tx.source)}</span>
                  <p className="text-[10px] text-text-muted">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono ${tx.type === 'income' ? 'text-green' : 'text-red'}`}>
                  {tx.type === 'income' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                </span>
                <button onClick={() => removeTransaction(i)} className="text-text-muted hover:text-red p-0.5">
                  <HiTrash className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowAdd(null)}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card p-5 w-full max-w-md flex flex-col gap-3"
          >
            <h3 className="font-display text-lg font-bold">
              {showAdd === 'expense' ? '💸 Nuevo gasto' : '💵 Nuevo ingreso'}
            </h3>
            <input
              type="number"
              value={newTx.amount}
              onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
              placeholder={`Monto en ${currency}`}
              min="0"
            />
            {showAdd === 'expense' ? (
              <select value={newTx.category} onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}>
                {expenseCategories.map((c) => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            ) : (
              <select value={newTx.source} onChange={(e) => setNewTx({ ...newTx, source: e.target.value })}>
                {incomeSources.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
            <input
              type="text"
              value={newTx.note}
              onChange={(e) => setNewTx({ ...newTx, note: e.target.value })}
              placeholder="Nota (opcional)"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(null)} className="flex-1 py-2 text-xs text-text-muted">Cancelar</button>
              <button onClick={addTransaction} className="flex-1 btn-primary text-xs py-2">Agregar</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
