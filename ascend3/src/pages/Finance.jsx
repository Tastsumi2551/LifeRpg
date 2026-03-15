import { useState, useMemo } from 'react';
import { useGameStore, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../stores/gameStore';

const CURRENCIES = ['USD', 'EUR', 'MXN', 'COP', 'ARS', 'CLP', 'PEN', 'VES', 'DOP'];

export default function Finance() {
  const { transactions, currency, addTransaction, deleteTransaction, setCurrency } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // Form
  const [txType, setTxType] = useState('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('comida');
  const [txDescription, setTxDescription] = useState('');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);

  const monthData = useMemo(() => {
    const filtered = transactions.filter((t) => t.date && t.date.startsWith(viewMonth));
    const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date) || Number(b.id) - Number(a.id));
    return { income, expenses, balance: income - expenses, transactions: sorted };
  }, [transactions, viewMonth]);

  const handleAdd = () => {
    const amount = parseFloat(txAmount);
    if (!amount || amount <= 0) return;
    addTransaction({ type: txType, amount, category: txCategory, description: txDescription.trim(), date: txDate });
    setTxAmount(''); setTxDescription('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setShowModal(false);
  };

  const getCatInfo = (type, catVal) => {
    const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return list.find((c) => c.value === catVal) || { icon: '📌', label: catVal };
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('es', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
  };

  const monthLabel = (ym) => {
    const [y, m] = ym.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[parseInt(m) - 1]} ${y}`;
  };

  const changeMonth = (delta) => {
    const [y, m] = viewMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setViewMonth(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Finanzas</h1>
        <p>Controla tus ingresos y gastos</p>
      </div>

      {/* Month Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <button className="btn-ghost" onClick={() => changeMonth(-1)} style={{ fontSize: '1.2rem' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{monthLabel(viewMonth)}</span>
        <button className="btn-ghost" onClick={() => changeMonth(1)} style={{ fontSize: '1.2rem' }}>→</button>
      </div>

      {/* Summary */}
      <div className="finance-summary">
        <div className="finance-card">
          <div className="amount" style={{ color: 'var(--green)' }}>{formatAmount(monthData.income)}</div>
          <div className="label">Ingresos</div>
        </div>
        <div className="finance-card">
          <div className="amount" style={{ color: 'var(--accent)' }}>{formatAmount(monthData.expenses)}</div>
          <div className="label">Gastos</div>
        </div>
        <div className="finance-card">
          <div className="amount" style={{ color: monthData.balance >= 0 ? 'var(--green)' : 'var(--accent)' }}>
            {formatAmount(monthData.balance)}
          </div>
          <div className="label">Balance</div>
        </div>
      </div>

      {/* Currency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Moneda:</span>
        <select
          className="form-input"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={{ width: 'auto', padding: '6px 30px 6px 10px', fontSize: '0.82rem' }}
        >
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Transactions */}
      <div className="section-title"><span className="icon">📊</span> Transacciones</div>

      {monthData.transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <p>No hay transacciones en {monthLabel(viewMonth)}.</p>
          <p className="sub">Registra un ingreso o gasto.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, marginBottom: 18, overflow: 'hidden' }}>
          {monthData.transactions.map((tx) => {
            const catInfo = getCatInfo(tx.type, tx.category);
            return (
              <div key={tx.id} className="transaction-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  <span style={{ fontSize: '1.3rem' }}>{catInfo.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{tx.description || catInfo.label}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>{tx.date} · {catInfo.label}</div>
                  </div>
                </div>
                <div style={{
                  fontWeight: 800, fontSize: '0.92rem',
                  color: tx.type === 'income' ? 'var(--green)' : 'var(--accent)',
                  marginRight: 8,
                }}>
                  {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                </div>
                <button className="btn-ghost" onClick={() => { if (window.confirm('Eliminar?')) deleteTransaction(tx.id); }} style={{ fontSize: '0.85rem' }}>
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button className="btn-primary" onClick={() => setShowModal(true)}>
        + Agregar Transaccion
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
            <h3>Nueva Transaccion</h3>

            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              <button
                className={`tab-btn ${txType === 'expense' ? 'active' : ''}`}
                onClick={() => { setTxType('expense'); setTxCategory('comida'); }}
                style={{ flex: 1 }}
              >
                Gasto
              </button>
              <button
                className={`tab-btn ${txType === 'income' ? 'active' : ''}`}
                onClick={() => { setTxType('income'); setTxCategory('salario'); }}
                style={{ flex: 1 }}
              >
                Ingreso
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Monto ({currency})</label>
              <input type="number" className="form-input" value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" autoFocus />
            </div>

            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select className="form-input" value={txCategory} onChange={(e) => setTxCategory(e.target.value)}>
                {(txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Descripcion (opcional)</label>
              <input className="form-input" value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)} placeholder="Ej: Almuerzo, Netflix..." />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input type="date" className="form-input" value={txDate} onChange={(e) => setTxDate(e.target.value)} />
            </div>

            <div className="btn-row">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAdd}>Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
