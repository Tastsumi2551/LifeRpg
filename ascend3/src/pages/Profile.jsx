import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore, ACHIEVEMENTS } from '../stores/gameStore';
import { useAuth } from '../lib/useAuth';

const AVATARS = ['🧑‍💻', '🧙‍♂️', '🧝‍♀️', '🦸‍♂️', '🥷', '👨‍🚀', '🧑‍🎓', '🧑‍💼', '🦹‍♂️', '🧑‍🔬', '🧑‍🎨', '🧑‍🍳'];

// ══════════════════════════════════════════════════════
// SHOP
// ══════════════════════════════════════════════════════

function Shop() {
  const { coins, shopItems, purchasedRewards, addShopItem, deleteShopItem, purchaseReward } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDesc, setItemDesc] = useState('');

  const handleAdd = () => {
    const price = parseInt(itemPrice);
    if (!itemName.trim() || !price || price <= 0) return;
    addShopItem({ name: itemName.trim(), price, description: itemDesc.trim() });
    setItemName(''); setItemPrice(''); setItemDesc('');
    setShowModal(false);
  };

  const handleBuy = (id) => {
    const item = shopItems.find((i) => i.id === id);
    if (!item) return;
    if (coins < item.price) return;
    if (window.confirm(`Comprar "${item.name}" por ${item.price} monedas?`)) {
      purchaseReward(id);
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16,
      }}>
        <div className="coin-display" style={{ fontSize: '0.95rem' }}>
          🪙 {coins} monedas
        </div>
      </div>

      {shopItems.length === 0 && purchasedRewards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <p>Tu tienda esta vacia.</p>
          <p className="sub">Crea recompensas personalizadas y compralas con monedas.</p>
        </div>
      ) : (
        <>
          {/* Available items */}
          {shopItems.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
                Disponibles
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {shopItems.map((item) => (
                  <div key={item.id} className="shop-item">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{item.name}</div>
                      {item.description && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.description}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: 'var(--coin)', fontSize: '0.88rem' }}>
                        🪙 {item.price}
                      </span>
                      <button
                        className="btn-coin btn-sm"
                        onClick={() => handleBuy(item.id)}
                        disabled={coins < item.price}
                      >
                        Comprar
                      </button>
                      <button className="btn-ghost" onClick={() => { if (window.confirm('Eliminar?')) deleteShopItem(item.id); }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchased */}
          {purchasedRewards.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
                Comprados
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {purchasedRewards.slice().reverse().map((item, i) => (
                  <div key={i} className="shop-item" style={{ opacity: 0.7 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {new Date(item.purchasedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.82rem' }}>Comprado</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <button className="btn-primary" onClick={() => setShowModal(true)}>
        + Crear Recompensa
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
            <h3>Nueva Recompensa</h3>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input className="form-input" value={itemName} onChange={(e) => setItemName(e.target.value)}
                placeholder="Ej: Ver una pelicula, Postre..." autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
            </div>
            <div className="form-group">
              <label className="form-label">Precio (monedas)</label>
              <input type="number" className="form-input" value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)} placeholder="50" min="1" />
            </div>
            <div className="form-group">
              <label className="form-label">Descripcion (opcional)</label>
              <input className="form-input" value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)} placeholder="Ej: 2 horas de videojuegos" />
            </div>
            <div className="btn-row">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleAdd}>Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// PROFILE PAGE
// ══════════════════════════════════════════════════════

export default function Profile() {
  const {
    displayName, avatar, skills, totalXP, missionsCompleted, streak, coins,
    unlockedAchievements, getPlayerLevel, setDisplayName, setAvatar,
    subjects, pomodoroSessions,
  } = useGameStore();
  const { logout } = useAuth();
  const canvasRef = useRef(null);
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [tab, setTab] = useState('stats');

  const level = getPlayerLevel();

  // ── Radar Chart ──
  const drawRadar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const size = Math.min(parent.offsetWidth - 32, 380);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.34;

    ctx.clearRect(0, 0, size, size);

    const arr = Object.values(skills);
    const angles = arr.map((_, i) => (i * 2 * Math.PI) / arr.length - Math.PI / 2);

    // Grid
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (r / 5) * i, 0, 2 * Math.PI);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Lines + labels
    const fontSize = Math.max(10, size * 0.03);
    ctx.font = `${fontSize}px Inter, Segoe UI, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    angles.forEach((angle, i) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();

      const lr = r + 22;
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${arr[i].icon} ${arr[i].name}`, cx + lr * Math.cos(angle), cy + lr * Math.sin(angle));
    });

    // Polygon
    ctx.beginPath();
    angles.forEach((angle, i) => {
      const sr = (r / 10) * Math.min(arr[i].level, 10);
      const x = cx + sr * Math.cos(angle);
      const y = cy + sr * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(233, 69, 96, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Vertices
    angles.forEach((angle, i) => {
      const sr = (r / 10) * Math.min(arr[i].level, 10);
      ctx.beginPath();
      ctx.arc(cx + sr * Math.cos(angle), cy + sr * Math.sin(angle), 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#e94560';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [skills]);

  useEffect(() => {
    if (tab === 'stats') {
      drawRadar();
      const handleResize = () => drawRadar();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [drawRadar, tab]);

  const saveName = () => {
    if (nameInput.trim()) setDisplayName(nameInput.trim());
    setEditName(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Perfil</h1>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 22, padding: 24 }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>{avatar}</div>

        {editName ? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10, maxWidth: 260, margin: '0 auto 10px' }}>
            <input className="form-input" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()} style={{ textAlign: 'center' }} autoFocus />
            <button className="btn-primary" onClick={saveName} style={{ width: 'auto', padding: '8px 14px' }}>✓</button>
          </div>
        ) : (
          <div
            onClick={() => { setNameInput(displayName); setEditName(true); }}
            style={{
              fontSize: '1.2rem', fontWeight: 700, marginBottom: 4, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {displayName || 'Toca para poner tu nombre'}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>✏️</span>
          </div>
        )}

        <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.95rem' }}>
          Nivel {level}
        </div>

        {/* Avatar Picker */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 8 }}>Avatar:</div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {AVATARS.map((a) => (
              <button key={a} onClick={() => setAvatar(a)} style={{
                background: a === avatar ? 'var(--accent)' : 'var(--bg-primary)',
                border: `2px solid ${a === avatar ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 8, padding: '4px 8px', fontSize: '1.2rem', cursor: 'pointer',
              }}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-group">
        <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
          Estadisticas
        </button>
        <button className={`tab-btn ${tab === 'achievements' ? 'active' : ''}`} onClick={() => setTab('achievements')}>
          Logros ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
        </button>
        <button className={`tab-btn ${tab === 'shop' ? 'active' : ''}`} onClick={() => setTab('shop')}>
          Tienda
        </button>
      </div>

      {/* ═══ STATS ═══ */}
      {tab === 'stats' && (
        <>
          <div className="grid-stats" style={{ marginBottom: 22 }}>
            <div className="stat-card">
              <div className="stat-value">{totalXP.toLocaleString()}</div>
              <div className="stat-label">XP Total</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{missionsCompleted}</div>
              <div className="stat-label">Misiones</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{streak}🔥</div>
              <div className="stat-label">Racha</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--coin)' }}>{coins}</div>
              <div className="stat-label">Monedas</div>
            </div>
          </div>

          <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 22 }}>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--purple)' }}>{pomodoroSessions}</div>
              <div className="stat-label">Pomodoros</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--blue)' }}>{subjects.length}</div>
              <div className="stat-label">Materias</div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="section-title"><span className="icon">📊</span> Radar de Habilidades</div>
          <div className="card" style={{ textAlign: 'center', marginBottom: 22, padding: '20px 10px' }}>
            <canvas ref={canvasRef} />
          </div>
        </>
      )}

      {/* ═══ ACHIEVEMENTS ═══ */}
      {tab === 'achievements' && (
        <div>
          <div className="grid-achievements" style={{ marginBottom: 22 }}>
            {ACHIEVEMENTS.map((a) => {
              const unlocked = unlockedAchievements.includes(a.id);
              return (
                <div key={a.id} className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
                  title={a.desc}>
                  <div className="ach-icon">{a.icon}</div>
                  <div className="ach-name">{a.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ SHOP ═══ */}
      {tab === 'shop' && <Shop />}

      {/* Logout */}
      <div style={{ marginTop: 24 }}>
        <button
          onClick={() => { if (window.confirm('Cerrar sesion?')) logout(); }}
          className="btn-secondary"
          style={{ width: '100%', color: 'var(--accent)', marginBottom: 20 }}
        >
          Cerrar Sesion
        </button>
      </div>
    </div>
  );
}
