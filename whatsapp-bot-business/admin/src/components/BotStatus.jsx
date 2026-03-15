import React, { useState, useEffect } from 'react';

export default function BotStatus() {
  const [status, setStatus] = useState({ connected: false, qr: null });

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/status');
        setStatus(await res.json());
      } catch {
        setStatus({ connected: false, qr: null });
      }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  if (status.connected) {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/50 text-green-400 text-sm">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        Conectado
      </span>
    );
  }

  return (
    <div className="relative">
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-900/50 text-yellow-400 text-sm cursor-pointer group">
        <span className="w-2 h-2 rounded-full bg-yellow-400" />
        Desconectado
      </span>
      {status.qr && (
        <div className="absolute right-0 top-full mt-2 p-4 bg-neutral-900 border border-white/10 rounded-xl shadow-xl z-50">
          <p className="text-xs text-neutral-400 mb-2 text-center">Escanea con WhatsApp</p>
          <img src={status.qr} alt="QR" className="w-48 h-48 rounded-lg" />
        </div>
      )}
    </div>
  );
}
