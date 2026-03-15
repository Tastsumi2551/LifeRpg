import React, { useState, useEffect } from 'react';

export default function Config() {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(setConfig)
      .catch(console.error);
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
    setSaving(false);
  };

  const updateService = (index, field, value) => {
    const updated = [...config.services];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, services: updated });
  };

  const addService = () => {
    setConfig({
      ...config,
      services: [...config.services, { name: 'Nuevo servicio', description: 'Descripción', price: '$0' }]
    });
  };

  const removeService = (index) => {
    setConfig({
      ...config,
      services: config.services.filter((_, i) => i !== index)
    });
  };

  const updateFaq = (index, field, value) => {
    const updated = [...config.faq];
    if (field === 'keywords') {
      updated[index] = { ...updated[index], keywords: value.split(',').map(k => k.trim()) };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setConfig({ ...config, faq: updated });
  };

  const addFaq = () => {
    setConfig({
      ...config,
      faq: [...config.faq, { keywords: ['palabra clave'], answer: 'Respuesta automática' }]
    });
  };

  const removeFaq = (index) => {
    setConfig({
      ...config,
      faq: config.faq.filter((_, i) => i !== index)
    });
  };

  if (!config) return <p className="text-neutral-500">Cargando configuración...</p>;

  return (
    <div className="space-y-8 pb-24">
      {/* Business Info */}
      <Section title="Información del negocio" icon="🏪">
        <Field label="Nombre del negocio" value={config.businessName}
          onChange={v => setConfig({ ...config, businessName: v })} />
        <Field label="Teléfono del dueño (para notificaciones)" value={config.ownerPhone}
          onChange={v => setConfig({ ...config, ownerPhone: v })} />
        <Field label="Email" value={config.contact?.email}
          onChange={v => setConfig({ ...config, contact: { ...config.contact, email: v } })} />
        <Field label="Instagram" value={config.contact?.instagram}
          onChange={v => setConfig({ ...config, contact: { ...config.contact, instagram: v } })} />
      </Section>

      {/* Location */}
      <Section title="Ubicación" icon="📍">
        <Field label="Dirección" value={config.location?.address}
          onChange={v => setConfig({ ...config, location: { ...config.location, address: v } })} />
        <Field label="Ciudad" value={config.location?.city}
          onChange={v => setConfig({ ...config, location: { ...config.location, city: v } })} />
        <Field label="Link Google Maps" value={config.location?.googleMaps}
          onChange={v => setConfig({ ...config, location: { ...config.location, googleMaps: v } })} />
      </Section>

      {/* Schedule */}
      <Section title="Horarios" icon="🕐">
        <Field label="Lunes a Viernes" value={config.schedule?.weekdays}
          onChange={v => setConfig({ ...config, schedule: { ...config.schedule, weekdays: v } })} />
        <Field label="Sábado" value={config.schedule?.saturday}
          onChange={v => setConfig({ ...config, schedule: { ...config.schedule, saturday: v } })} />
        <Field label="Domingo" value={config.schedule?.sunday}
          onChange={v => setConfig({ ...config, schedule: { ...config.schedule, sunday: v } })} />
      </Section>

      {/* Services */}
      <Section title="Servicios / Productos" icon="📋">
        {config.services.map((service, i) => (
          <div key={i} className="bg-neutral-800 rounded-lg p-4 space-y-3 relative">
            <button onClick={() => removeService(i)}
              className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-sm">
              Eliminar
            </button>
            <Field label="Nombre" value={service.name} onChange={v => updateService(i, 'name', v)} />
            <Field label="Descripción" value={service.description} onChange={v => updateService(i, 'description', v)} />
            <Field label="Precio" value={service.price} onChange={v => updateService(i, 'price', v)} />
          </div>
        ))}
        <button onClick={addService}
          className="w-full py-2 border border-dashed border-white/20 rounded-lg text-neutral-400 hover:text-white hover:border-white/40 transition text-sm">
          + Agregar servicio
        </button>
      </Section>

      {/* Welcome Message */}
      <Section title="Mensaje de bienvenida" icon="👋">
        <TextArea label="Mensaje que se envía cuando alguien escribe por primera vez"
          value={config.welcome}
          onChange={v => setConfig({ ...config, welcome: v })} />
        <p className="text-xs text-neutral-500 mt-1">
          Usa {'{businessName}'} para insertar el nombre del negocio automáticamente
        </p>
      </Section>

      {/* FAQ */}
      <Section title="Respuestas automáticas (FAQ)" icon="❓">
        {config.faq.map((faq, i) => (
          <div key={i} className="bg-neutral-800 rounded-lg p-4 space-y-3 relative">
            <button onClick={() => removeFaq(i)}
              className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-sm">
              Eliminar
            </button>
            <Field label="Palabras clave (separadas por coma)"
              value={faq.keywords.join(', ')}
              onChange={v => updateFaq(i, 'keywords', v)} />
            <TextArea label="Respuesta"
              value={faq.answer}
              onChange={v => updateFaq(i, 'answer', v)} />
          </div>
        ))}
        <button onClick={addFaq}
          className="w-full py-2 border border-dashed border-white/20 rounded-lg text-neutral-400 hover:text-white hover:border-white/40 transition text-sm">
          + Agregar pregunta frecuente
        </button>
      </Section>

      {/* Auto replies */}
      <Section title="Respuestas del sistema" icon="🤖">
        <TextArea label="Fuera de horario" value={config.autoReplies?.outsideHours}
          onChange={v => setConfig({ ...config, autoReplies: { ...config.autoReplies, outsideHours: v } })} />
        <TextArea label="Cuando piden hablar con humano" value={config.autoReplies?.humanRequested}
          onChange={v => setConfig({ ...config, autoReplies: { ...config.autoReplies, humanRequested: v } })} />
        <TextArea label="Mensaje no reconocido" value={config.autoReplies?.unknown}
          onChange={v => setConfig({ ...config, autoReplies: { ...config.autoReplies, unknown: v } })} />
        <TextArea label="Agradecimiento" value={config.autoReplies?.thanks}
          onChange={v => setConfig({ ...config, autoReplies: { ...config.autoReplies, thanks: v } })} />
      </Section>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-950/90 backdrop-blur border-t border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex justify-end">
          <button onClick={save} disabled={saving}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-green-500 hover:bg-green-400 text-black'
            }`}>
            {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">{icon} {title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-neutral-400 mb-1">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-neutral-400 mb-1">{label}</label>
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        rows={4}
        className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500 transition resize-y"
      />
    </div>
  );
}
