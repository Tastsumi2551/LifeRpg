# WhatsApp Bot Business

Bot de WhatsApp automatizado y configurable para negocios. Listo para vender como servicio.

## Qué incluye

- **Bot de WhatsApp** que responde automáticamente a clientes
- **Panel de administración** web para configurar sin tocar código
- **Dashboard** con métricas de mensajes y contactos
- **Configuración flexible**: servicios, horarios, FAQ, respuestas automáticas
- **Funciona con cualquier negocio**: restaurantes, barberías, tiendas, clínicas, etc.

## Funcionalidades del bot

| Función | Descripción |
|---|---|
| Menú interactivo | El cliente elige opciones con números (1-5) |
| Catálogo de servicios | Muestra servicios con precios |
| Horarios y ubicación | Con link a Google Maps |
| Agendar citas/pedidos | Recibe solicitudes automáticamente |
| FAQ inteligente | Responde por palabras clave |
| Derivar a humano | Opción para hablar con una persona |
| Saludos automáticos | Detecta hola, gracias, adiós |
| Métricas | Cuenta mensajes, contactos, actividad diaria |

## Requisitos

- Node.js 18+
- Google Chrome o Chromium (para whatsapp-web.js)
- Un número de WhatsApp dedicado al negocio

## Instalación

```bash
# 1. Instalar dependencias del bot
cd whatsapp-bot-business
npm install

# 2. Instalar dependencias del panel admin
cd admin
npm install
cd ..

# 3. Iniciar el bot
npm run dev

# 4. En otra terminal, iniciar el panel admin
npm run admin
```

## Uso

1. Abre `http://localhost:3001` en tu navegador
2. Escanea el código QR con WhatsApp (Dispositivos vinculados)
3. El bot empezará a responder mensajes automáticamente
4. Configura el bot desde el panel admin en `http://localhost:5173`

## Configurar para un cliente

Edita `src/config/business.json` o usa el panel admin:

1. **Nombre del negocio**: Aparece en todos los mensajes
2. **Servicios**: Agrega los servicios/productos con precios
3. **Horarios**: Define días y horas de atención
4. **Ubicación**: Dirección y link de Google Maps
5. **FAQ**: Agrega preguntas frecuentes con palabras clave
6. **Mensajes**: Personaliza el mensaje de bienvenida y respuestas

## Estructura del proyecto

```
whatsapp-bot-business/
├── src/
│   ├── index.js              # Servidor principal
│   ├── routes/api.js          # API REST para el panel admin
│   ├── services/
│   │   └── messageHandler.js  # Lógica de respuestas del bot
│   └── config/
│       ├── business.json      # Configuración del negocio
│       └── stats.json         # Estadísticas (auto-generado)
├── admin/                     # Panel de administración (React)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  # Métricas y estadísticas
│   │   │   └── Config.jsx     # Configuración del bot
│   │   └── components/
│   │       └── BotStatus.jsx  # Indicador de conexión
│   └── package.json
├── package.json
└── README.md
```

## Deploy en producción

### Opción 1: VPS (DigitalOcean, Hetzner)
```bash
# En el servidor
git clone <tu-repo>
cd whatsapp-bot-business
npm install
cd admin && npm install && npm run build && cd ..

# Usar PM2 para mantener el bot activo
npm install -g pm2
pm2 start src/index.js --name whatsapp-bot
pm2 save
pm2 startup
```

### Opción 2: Railway / Render
- Conecta tu repo de GitHub
- Se despliega automáticamente

## Cómo vender este servicio

### Precio sugerido

| Paquete | Precio | Incluye |
|---|---|---|
| Básico | $300-400 | Setup + configuración + 1 mes soporte |
| Estándar | $500-800 | Básico + personalización + 3 meses soporte |
| Premium | $800-1200 | Estándar + hosting + mantenimiento 6 meses |

### Costos recurrentes que puedes cobrar

| Concepto | Precio mensual |
|---|---|
| Hosting del bot | $20-50/mes |
| Soporte técnico | $30-50/mes |
| Actualizaciones | $20-30/mes |
| **Total recurrente** | **$70-130/mes** |

### Pitch de venta

> "Le instalo un bot de WhatsApp a su negocio que responde automáticamente
> a sus clientes 24/7. Muestra su catálogo, precios, horarios y recibe
> pedidos/citas, todo sin que usted tenga que estar pendiente del teléfono.
> Incluye un panel web donde puede cambiar todo sin saber programar."

### Dónde conseguir clientes

1. Negocios locales que conoces
2. Grupos de empresarios en Facebook/WhatsApp
3. Instagram (muestra demos en video)
4. Workana, Fiverr, Upwork
5. Visita presencial con demo en tu teléfono

## Licencia

Uso comercial permitido. Personaliza y vende libremente.
