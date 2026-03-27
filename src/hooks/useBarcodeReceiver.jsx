import { useEffect, useRef } from 'react';

let globalWs = null;
let globalReconnectTimeout = null;
let globalListeners = [];

const connectWebSocket = () => {
  if (
    globalWs &&
    (globalWs.readyState === WebSocket.OPEN ||
      globalWs.readyState === WebSocket.CONNECTING)
  ) {
    console.log('WebSocket déjà connecté ou en cours');
    return;
  }

const WS_URL = 'ws://10.184.121.167:3001';
  const ws = new WebSocket(WS_URL);
  globalWs = ws;

  if (typeof window !== 'undefined') {
    window.globalWs = ws;
  }

  ws.onopen = () => {
    console.log('✅ WebSocket connecté');
    if (globalReconnectTimeout) {
      clearTimeout(globalReconnectTimeout);
      globalReconnectTimeout = null;
    }
  };

  ws.onmessage = (event) => {
    const data = event.data;
    console.log('📥 Message reçu:', data);

    // 🔥 Déclenche un événement personnalisé pour tous les messages
    if (typeof window !== 'undefined') {
      console.log('📢 Déclenchement événement websocket-message');
      window.dispatchEvent(new CustomEvent('websocket-message', { detail: data }));
    }

    // Si c'est un JSON (résultat OCR), on le propage aux listeners et on s'arrête
    if (typeof data === 'string' && data.startsWith('{')) {
      globalListeners.forEach((listener) => listener(data));
      return; // important : ne pas traiter comme un code-barres
    }

    // Nettoyer le code : enlever le caractère GS (ASCII 29) et autres caractères de contrôle
    let cleaned = data.replace(/[\x00-\x1F\x7F]/g, '').trim();
    if (cleaned === '✅ Connecté au serveur de scan' || cleaned === 'ping') return;

    if (!cleaned) return;

    // Injection dans le champ actif
    let target = document.activeElement;
    if (!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')) {
      target = document.querySelector('input, textarea');
      if (target) console.log('🎯 Fallback input utilisé');
    }

    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      try {
        target.focus();
        target.value = cleaned;
        target.dispatchEvent(new Event('input', { bubbles: true }));

        setTimeout(() => {
          target.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Enter',
              bubbles: true,
            })
          );
          target.blur();
        }, 50);

        console.log('✅ Code injecté avec succès:', cleaned);
      } catch (e) {
        console.error('❌ Erreur injection:', e);
      }
    } else {
      console.warn('⚠️ Aucun champ input trouvé');
    }
  };

  ws.onerror = (err) => {
    console.error('❌ Erreur WebSocket:', err);
  };

  ws.onclose = () => {
    console.warn('⚠️ WebSocket fermé');
    if (globalReconnectTimeout) clearTimeout(globalReconnectTimeout);
    globalReconnectTimeout = setTimeout(() => {
      console.log('🔄 Tentative de reconnexion...');
      connectWebSocket();
    }, 2000);
  };
};

export default function useBarcodeReceiver() {
  const listenerRef = useRef(null);

  useEffect(() => {
    if (!globalWs || globalWs.readyState === WebSocket.CLOSED) {
      connectWebSocket();
    }

    const onMessage = (raw) => {
      console.log('useBarcodeReceiver a reçu:', raw);
    };

    globalListeners.push(onMessage);
    listenerRef.current = onMessage;

    return () => {
      const index = globalListeners.indexOf(onMessage);
      if (index !== -1) globalListeners.splice(index, 1);
    };
  }, []);
}