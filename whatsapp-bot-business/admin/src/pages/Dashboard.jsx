import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-neutral-500">Cargando estadísticas...</p>;
  if (!stats) return <p className="text-red-400">Error cargando estadísticas. ¿Está el servidor corriendo?</p>;

  const today = new Date().toISOString().split('T')[0];
  const todayMessages = stats.dailyMessages?.[today] || 0;

  // Get last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    last7Days.push({
      date: d.toLocaleDateString('es', { weekday: 'short', day: 'numeric' }),
      count: stats.dailyMessages?.[key] || 0
    });
  }
  const maxMessages = Math.max(...last7Days.map(d => d.count), 1);

  // Recent contacts
  const recentContacts = Object.entries(stats.contacts || {})
    .sort((a, b) => (b[1].lastContact || '').localeCompare(a[1].lastContact || ''))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon="💬"
          label="Mensajes hoy"
          value={todayMessages}
          color="text-blue-400"
        />
        <StatCard
          icon="📨"
          label="Total mensajes"
          value={stats.totalMessages}
          color="text-green-400"
        />
        <StatCard
          icon="👥"
          label="Contactos únicos"
          value={stats.totalContacts}
          color="text-purple-400"
        />
      </div>

      {/* Chart - Last 7 days */}
      <div className="bg-neutral-900 border border-white/10 rounded-xl p-6">
        <h3 className="text-sm font-medium text-neutral-400 mb-4">Mensajes - Últimos 7 días</h3>
        <div className="flex items-end gap-2 h-40">
          {last7Days.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-neutral-500">{day.count}</span>
              <div
                className="w-full bg-green-500/20 rounded-t-md transition-all relative group"
                style={{ height: `${(day.count / maxMessages) * 100}%`, minHeight: day.count > 0 ? '8px' : '2px' }}
              >
                <div
                  className="absolute inset-0 bg-green-500/40 rounded-t-md"
                  style={{ height: '100%' }}
                />
              </div>
              <span className="text-xs text-neutral-500">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent contacts */}
      <div className="bg-neutral-900 border border-white/10 rounded-xl p-6">
        <h3 className="text-sm font-medium text-neutral-400 mb-4">Contactos recientes</h3>
        {recentContacts.length === 0 ? (
          <p className="text-neutral-600 text-sm">Aún no hay contactos. Los verás aquí cuando alguien escriba al bot.</p>
        ) : (
          <div className="space-y-3">
            {recentContacts.map(([phone, data]) => (
              <div key={phone} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-mono">{phone.replace('@c.us', '')}</p>
                  <p className="text-xs text-neutral-500">Primer contacto: {data.firstContact}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-400">{data.messageCount} msgs</p>
                  <p className="text-xs text-neutral-500">{data.lastContact}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-neutral-900 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
