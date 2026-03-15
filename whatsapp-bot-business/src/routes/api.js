import { Router } from 'express';
import { getStats, getConfig, updateConfig } from '../services/messageHandler.js';

const router = Router();

// Get bot stats
router.get('/stats', (req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error loading stats' });
  }
});

// Get current config
router.get('/config', (req, res) => {
  try {
    const config = getConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Error loading config' });
  }
});

// Update config
router.put('/config', (req, res) => {
  try {
    const updated = updateConfig(req.body);
    res.json({ success: true, config: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error updating config' });
  }
});

// Get QR status
router.get('/status', (req, res) => {
  const client = req.app.get('whatsappClient');
  res.json({
    connected: req.app.get('whatsappReady') || false,
    qr: req.app.get('currentQR') || null
  });
});

export default router;
