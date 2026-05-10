import WebSocket, { WebSocketServer } from 'ws';
import axios from 'axios';
import FormData from 'form-data';

const PORT = 3001;
const BACKEND_URL = 'http://localhost:8080/api/ocr/extract';

const wss = new WebSocketServer({ port: PORT });

console.log(`🚀 Serveur WebSocket lancé sur ws://0.0.0.0:${PORT}`);

wss.on('connection', (ws) => {
  console.log('📱 Client connecté');
  ws.send('✅ Connecté au serveur de scan');

  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 20000);

  ws.on('pong', () => console.log('🏓 Pong reçu'));

  ws.on('message', async (message) => {
    const msgStr = message.toString();
    console.log(`📦 Reçu: ${msgStr.substring(0, 100)}...`);

    // ========== TRAITEMENT OCR ==========
    if (msgStr.startsWith('OCR:')) {
      console.log('🔍 Message OCR détecté');
      const base64Image = msgStr.substring(4);
      await processOCR(base64Image);
      return;
    }

    if (msgStr === 'ping') return;

    // ========== DIFFUSION DES CODE-BARRES À TOUS LES CLIENTS ==========
    let count = 0;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msgStr);
        count++;
      }
    });
    console.log(`📤 Code-barres diffusé à ${count} client(s)`);
  });

  ws.on('close', () => {
    clearInterval(interval);
    console.log('⚠️ Client déconnecté');
  });

  ws.on('error', (err) => {
    console.error('❌ Erreur WebSocket:', err);
  });
});

// ========== FONCTION OCR - DIFFUSE LE RÉSULTAT À TOUS LES CLIENTS ==========
async function processOCR(base64Image) {
  console.log('📤 Envoi de l\'image au backend OCR...');
  try {
    const imageBuffer = Buffer.from(base64Image, 'base64');
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'scan.jpg',
      contentType: 'image/jpeg'
    });

    const response = await axios.post(BACKEND_URL, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 30000
    });

    console.log('✅ Résultat OCR:', response.data);
    
    // Envoyer le JSON directement à TOUS les clients
    const message = JSON.stringify(response.data);
    
    let count = 0;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        count++;
      }
    });
    console.log(`📤 Résultat OCR diffusé à ${count} client(s)`);
    
  } catch (error) {
    console.error('❌ Erreur OCR:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    // Envoyer l'erreur à tous les clients
    const errorMessage = JSON.stringify({ error: error.message });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(errorMessage);
      }
    });
  }
}