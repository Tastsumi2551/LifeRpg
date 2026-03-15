import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore, ACHIEVEMENTS } from '../stores/gameStore';
import { useAuth } from '../lib/useAuth';

const AVATARS = ['🧑‍💻', '🧙‍♂️', '🧝‍♀️', '🦸‍♂️', '🥷', '👨‍🚀', '🧑‍🎓', '🧑‍💼', '🦹‍♂️', '🧑‍🔬', '🧑‍🎨', '🧑‍🍳'];

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
    setItemName(''); setItemPrice(''); setItemDesc(''); setShowModal(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div className="coin-display" style={{ fontSize: '0.9rem' }}>
          🪙 {coins} monedas disponibles
        </div>
      </div>

      {shopItems.length === 0 && purchasedRewards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">--</div>
          <p>Tu tienda esta vacia</p>
          <p className="sub">Crea recompensas personalizadas</p>
        </div>
      ) : (
        <>
          {shopItems.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="section-title">Disponibles</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {shopItems.map((item) => (
                  <div key={item.id} className="shop-item">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 1 }}>{item.name}</div>
                      {item.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.description}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, color: 'var(--coin)', fontSize: '0.85rem' }}>🪙 {item.price}</span>
                      <button className="btn-coin btn-sm" onClick={() => {
                        if (coins >= item.price && window.confirm(`Comprar "${item.name}"?`)) purchaseReward(item.id);
                      }} disabled={coins < item.price}>Comprar</button>
                      <button className="btn-ghost" onClick={() => { if (window.confirm('Eliminar?')) deleteShopItem(item.id); }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {purchasedRewards.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="section-title">Comprados</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {purchasedRewards.slice().reverse().map((item, i) => (
                  <div key={i} className="shop-item" style={{ opacity: 0.6 }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-disabled)' }}>
                        {new Date(item.purchasedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.78rem' }}>Comprado</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <button className="btn-primary" onClick={() => setShowModal(true)}>Crear recompensa</button>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
            <h3>Nueva recompensa</h3>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input className="form-input" value={itemName} onChange={(e) => setItemName(e.target.value)}
                placeholder="Ej: Ver una pelicula" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
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

  const drawRadar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const size = Math.min(parent.offsetWidth - 32, 340);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cx = size / 2, cy = size / 2, r = size * 0.33;
    ctx.clearRect(0, 0, size, size);

    const arr = Object.values(skills);
    const angles = arr.map((_, i) => (i * 2 * Math.PI) / arr.length - Math.PI / 2);

    // Grid
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath(); ctx.arc(cx, cy, (r / 5) * i, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.stroke();
    }

    // Lines + labels
    const fontSize = Math.max(10, size * 0.03);
    ctx.font = `500 ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    angles.forEach((angle, i) => {
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.stroke();
      const lr = r + 20;
      ctx.fillStyle = '#636b7e';
      ctx.fillText(arr[i].name, cx + lr * Math.cos(angle), cy + lr * Math.sin(angle));
    });

    // Polygon
    ctx.beginPath();
    angles.forEach((angle, i) => {
      const sr = (r / 10) * Math.min(arr[i].level, 10);
      const x = cx + sr * Math.cos(angle), y = cy + sr * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(233, 69, 96, 0.15)'; ctx.fill();
    ctx.strokeStyle = '#e94560'; ctx.lineWidth = 2; ctx.stroke();

    // Vertices
    angles.forEach((angle, i) => {
      const sr = (r / 10) * Math.min(arr[i].level, 10);
      ctx.beginPath();
      ctx.arc(cx + sr * Math.cos(angle), cy + sr * Math.sin(angle), 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#e94560'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    });
  }, [skills]);

  useEffect(() => {
    if (tab === 'stats') {
      drawRadar();
      const h = () => drawRadar();
      window.addEventListener('resize', h);
      return () => window.removeEventListener('resize', h);
    }
  }, [drawRadar, tab]);

  const saveName = () => {
    if (nameInput.trim()) setDisplayName(nameInput.trim());
    setEditName(false);
  };

  return (
    <div>
      <div className="page-header"><h1>Perfil</h1></div>

      {/* Profile Card */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 20, padding: 20 }}>
        <div style={{ fontSize: '2.6rem', marginBottom: 6 }}>{avatar}</div>

        {editName ? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', maxWidth: 240, margin: '0 auto 8px' }}>
            <input className="form-input" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()} style={{ textAlign: 'center' }} autoFocus />
            <button className="btn-primary" onClick={saveName} style={{ width: 'auto', padding: '8px 12px' }}>✓</button>
          </div>
        ) : (
          <div onClick={() => { setNameInput(displayName); setEditName(true); }}
            style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 2, cursor: 'pointer', color: 'var(--text-primary)' }}>
            {displayName || 'Toca para poner tu nombre'}
          </div>
        )}

        <div style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: '0.85rem' }}>
          Nivel {level}
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-disabled)', marginBottom: 6 }}>Avatar</div>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            {AVATARS.map((a) => (
              <button key={a} onClick={() => setAvatar(a)} style={{
                background: a === avatar ? 'var(--bg-active)' : 'var(--bg-1)',
                border: `1px solid ${a === avatar ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 6, padding: '3px 7px', fontSize: '1.1rem', cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-group">
        <button className={`tab-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>Estadisticas</button>
        <button className={`tab-btn ${tab === 'achievements' ? 'active' : ''}`} onClick={() => setTab('achievements')}>
          Logros ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
        </button>
        <button className={`tab-btn ${tab === 'shop' ? 'active' : ''}`} onClick={() => setTab('shop')}>Tienda</button>
      </div>

      {tab === 'stats' && (
        <>
          <div className="grid-stats" style={{ marginBottom: 16 }}>
            <div className="stat-card"><div className="stat-value">{totalXP.toLocaleString()}</div><div className="stat-label">XP Total</div></div>
            <div className="stat-card"><div className="stat-value">{missionsCompleted}</div><div className="stat-label">Misiones</div></div>
            <div className="stat-card"><div className="stat-value">{streak}d</div><div className="stat-label">Racha</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--coin)' }}>{coins}</div><div className="stat-label">Monedas</div></div>
          </div>
          <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 20 }}>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--purple)' }}>{pomodoroSessions}</div><div className="stat-label">Pomodoros</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--info)' }}>{subjects.length}</div><div className="stat-label">Materias</div></div>
          </div>
          <div className="section-title">Radar de habilidades</div>
          <div className="card" style={{ textAlign: 'center', marginBottom: 20, padding: '16px 8px' }}>
            <canvas ref={canvasRef} />
          </div>
        </>
      )}

      {tab === 'achievements' && (
        <div className="grid-achievements" style={{ marginBottom: 20 }}>
          {ACHIEVEMENTS.map((a) => {
            const unlocked = unlockedAchievements.includes(a.id);
            return (
              <div key={a.id} className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`} title={a.desc}>
                <div className="ach-icon">{a.icon}</div>
                <div className="ach-name">{a.name}</div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'shop' && <Shop />}

      <div style={{ marginTop: 20 }}>
        <button onClick={() => { if (window.confirm('Cerrar sesion?')) logout(); }}
          className="btn-secondary" style={{ width: '100%', marginBottom: 16 }}>
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}
