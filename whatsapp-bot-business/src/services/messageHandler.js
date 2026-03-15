import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, '..', 'config', 'business.json');
const statsPath = join(__dirname, '..', 'config', 'stats.json');

function loadConfig() {
  return JSON.parse(readFileSync(configPath, 'utf-8'));
}

function loadStats() {
  if (!existsSync(statsPath)) {
    const initial = { totalMessages: 0, totalContacts: 0, contacts: {}, dailyMessages: {} };
    writeFileSync(statsPath, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(readFileSync(statsPath, 'utf-8'));
}

function saveStats(stats) {
  writeFileSync(statsPath, JSON.stringify(stats, null, 2));
}

function trackMessage(from, isIncoming) {
  const stats = loadStats();
  const today = new Date().toISOString().split('T')[0];

  stats.totalMessages++;
  stats.dailyMessages[today] = (stats.dailyMessages[today] || 0) + 1;

  if (!stats.contacts[from]) {
    stats.contacts[from] = { firstContact: today, messageCount: 0 };
    stats.totalContacts++;
  }
  stats.contacts[from].messageCount++;
  stats.contacts[from].lastContact = today;

  saveStats(stats);
}

function formatTemplate(template, config) {
  return template
    .replace(/\{businessName\}/g, config.businessName)
    .replace(/\{city\}/g, config.location?.city || '')
    .replace(/\{schedule\}/g, [
      config.schedule.weekdays,
      config.schedule.saturday,
      config.schedule.sunday
    ].join('\n'));
}

function matchesKeywords(text, keywords) {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return keywords.some(kw => {
    const normalizedKw = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return lower.includes(normalizedKw);
  });
}

export function handleMessage(message) {
  const config = loadConfig();
  const text = message.body?.trim();
  const from = message.from;

  if (!text) return null;

  trackMessage(from, true);

  // Check greetings
  if (matchesKeywords(text, config.keywords.greetings)) {
    return formatTemplate(config.welcome, config);
  }

  // Check thanks
  if (matchesKeywords(text, config.keywords.thanks)) {
    return formatTemplate(config.autoReplies.thanks, config);
  }

  // Check bye
  if (matchesKeywords(text, config.keywords.bye)) {
    return `¡Hasta pronto! 👋 Fue un placer atenderte en *${config.businessName}*. ¡Vuelve cuando quieras!`;
  }

  // Menu options (1-5)
  switch (text) {
    case '1': {
      let response = `📋 *Nuestros Servicios en ${config.businessName}:*\n\n`;
      config.services.forEach((s, i) => {
        response += `*${i + 1}. ${s.name}*\n${s.description}\n💰 ${s.price}\n\n`;
      });
      response += `_¿Te interesa alguno? Escribe el nombre o número del servicio._`;
      return response;
    }

    case '2': {
      return `🕐 *Horarios de ${config.businessName}:*\n\n` +
        `${config.schedule.weekdays}\n${config.schedule.saturday}\n${config.schedule.sunday}\n\n` +
        `📍 *Ubicación:*\n${config.location.address}\n\n` +
        `🗺️ Google Maps: ${config.location.googleMaps}`;
    }

    case '3': {
      let response = `💰 *Precios de ${config.businessName}:*\n\n`;
      config.services.forEach(s => {
        response += `• *${s.name}*: ${s.price}\n`;
      });
      response += `\n_¿Deseas agendar o hacer un pedido? Escribe *4*_`;
      return response;
    }

    case '4': {
      return `📝 *¡Perfecto! Para agendar/pedir:*\n\n` +
        `Por favor envíanos:\n` +
        `1. Tu nombre completo\n` +
        `2. Servicio que deseas\n` +
        `3. Fecha y hora preferida\n\n` +
        `_Ejemplo: "Juan Pérez, Servicio 1, Martes 3pm"_\n\n` +
        `Te confirmaremos la disponibilidad enseguida.`;
    }

    case '5': {
      return formatTemplate(config.autoReplies.humanRequested, config);
    }

    default:
      break;
  }

  // Check FAQ keywords
  for (const faq of config.faq) {
    if (matchesKeywords(text, faq.keywords)) {
      return formatTemplate(faq.answer, config);
    }
  }

  // Check if it looks like an appointment/order request
  if (text.length > 15 && (text.includes(',') || text.includes('-'))) {
    const details = text;
    return formatTemplate(
      config.autoReplies.appointmentReceived
        .replace('{date}', 'Por confirmar')
        .replace('{service}', details),
      config
    );
  }

  // Default: unknown message
  return formatTemplate(config.autoReplies.unknown, config);
}

export function getStats() {
  return loadStats();
}

export function getConfig() {
  return loadConfig();
}

export function updateConfig(newConfig) {
  writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
  return loadConfig();
}
