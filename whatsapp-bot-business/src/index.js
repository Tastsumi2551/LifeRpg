import express from 'express';
import cors from 'cors';
import pkg from 'whatsapp-web.js';
import QRCode from 'qrcode';
import apiRoutes from './routes/api.js';
import { handleMessage } from './services/messageHandler.js';

const { Client, LocalAuth } = pkg;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════
// WhatsApp Client Setup
// ═══════════════════════════════════════

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

let currentQR = null;
let isReady = false;

client.on('qr', async (qr) => {
  currentQR = await QRCode.toDataURL(qr);
  isReady = false;
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  📱 Escanea el QR desde el panel     ║');
  console.log('║  admin o abre: http://localhost:3001  ║');
  console.log('╚══════════════════════════════════════╝\n');
});

client.on('ready', () => {
  isReady = true;
  currentQR = null;
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  ✅ Bot de WhatsApp CONECTADO        ║');
  console.log('║  Listo para recibir mensajes         ║');
  console.log('╚══════════════════════════════════════╝\n');
});

client.on('disconnected', (reason) => {
  isReady = false;
  console.log('❌ Desconectado:', reason);
  // Reconnect after 5 seconds
  setTimeout(() => client.initialize(), 5000);
});

client.on('message', async (msg) => {
  // Ignore group messages and status updates
  if (msg.from.includes('@g.us') || msg.from === 'status@broadcast') return;

  try {
    const response = handleMessage(msg);
    if (response) {
      await msg.reply(response);
      console.log(`📩 ${msg.from}: ${msg.body?.substring(0, 50)}`);
      console.log(`📤 Respondido automáticamente`);
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
});

// ═══════════════════════════════════════
// Express API
// ═══════════════════════════════════════

app.set('whatsappClient', client);
app.set('whatsappReady', false);
app.set('currentQR', null);

// Update shared state
const updateState = () => {
  app.set('whatsappReady', isReady);
  app.set('currentQR', currentQR);
};
setInterval(updateState, 1000);

app.use('/api', apiRoutes);

// Serve QR page for quick setup
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WhatsApp Bot - Setup</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, sans-serif;
          background: #0a0a0a; color: #fff;
          display: flex; justify-content: center; align-items: center;
          min-height: 100vh;
        }
        .container { text-align: center; padding: 2rem; }
        h1 { font-size: 1.5rem; margin-bottom: 1rem; }
        .status {
          padding: 0.5rem 1rem; border-radius: 999px;
          display: inline-block; margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }
        .connected { background: #065f46; color: #6ee7b7; }
        .waiting { background: #713f12; color: #fcd34d; }
        #qr img { border-radius: 12px; max-width: 280px; }
        .info { margin-top: 1.5rem; color: #888; font-size: 0.875rem; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 WhatsApp Bot Business</h1>
        <div id="statusBadge" class="status waiting">Cargando...</div>
        <div id="qr"></div>
        <div id="connectedMsg" style="display:none">
          <p style="font-size: 3rem;">✅</p>
          <p style="margin-top: 1rem; font-size: 1.1rem;">Bot conectado y funcionando</p>
        </div>
        <div class="info">
          <p>Abre WhatsApp en tu teléfono → Dispositivos vinculados → Vincular dispositivo</p>
        </div>
      </div>
      <script>
        async function checkStatus() {
          try {
            const res = await fetch('/api/status');
            const data = await res.json();
            const badge = document.getElementById('statusBadge');
            const qr = document.getElementById('qr');
            const connected = document.getElementById('connectedMsg');

            if (data.connected) {
              badge.textContent = '🟢 Conectado';
              badge.className = 'status connected';
              qr.style.display = 'none';
              connected.style.display = 'block';
            } else if (data.qr) {
              badge.textContent = '📱 Escanea el QR';
              badge.className = 'status waiting';
              qr.innerHTML = '<img src="' + data.qr + '" alt="QR Code">';
              qr.style.display = 'block';
              connected.style.display = 'none';
            } else {
              badge.textContent = '⏳ Generando QR...';
              badge.className = 'status waiting';
            }
          } catch (e) {
            console.error(e);
          }
        }
        checkStatus();
        setInterval(checkStatus, 3000);
      </script>
    </body>
    </html>
  `);
});

// ═══════════════════════════════════════
// Start
// ═══════════════════════════════════════

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor API: http://localhost:${PORT}`);
  console.log(`📊 Panel admin:  http://localhost:5173 (npm run admin)\n`);
  console.log('⏳ Conectando a WhatsApp...\n');
  client.initialize();
});
