import { useEffect, useRef } from 'react';

let globalWs = null;
let globalReconnectTimeout = null;
let globalListeners = [];

const connectWebSocket = () => {
  try {
    if (
      globalWs &&
      (globalWs.readyState === WebSocket.OPEN ||
        globalWs.readyState === WebSocket.CONNECTING)
    ) {
      console.log('WebSocket déjà connecté ou en cours');
      return;
    }

    const WS_URL = 'ws://192.168.173.167:3001';
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

      if (typeof window !== 'undefined') {
        console.log('📢 Déclenchement événement websocket-message');
        window.dispatchEvent(new CustomEvent('websocket-message', { detail: data }));
      }

      if (typeof data === 'string' && data.startsWith('{')) {
        globalListeners.forEach((listener) => listener(data));
        return;
      }

      let cleaned = data.replace(/[\x00-\x1F\x7F]/g, '').trim();
      if (cleaned === '✅ Connecté au serveur de scan' || cleaned === 'ping') return;

      if (!cleaned) return;

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
  } catch (error) {
    console.error('Erreur lors de la connexion WebSocket:', error);
    // Ne pas propager l'erreur pour éviter de casser le rendu
  }
};

export default function useBarcodeReceiver() {
  const listenerRef = useRef(null);

  useEffect(() => {
    try {
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
    } catch (error) {
      console.error('Erreur dans useBarcodeReceiver:', error);
    }
  }, []);
}