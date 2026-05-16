import { createContext, useContext, useState, useEffect } from 'react';

// Capture BEFORE React mounts — the browser fires beforeinstallprompt very early
let _installEvent = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _installEvent = e;
    // Notify any already-mounted context
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });
}

const PWAContext = createContext(null);

export function PWAProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(_installEvent);
  const [isInstalled, setIsInstalled]       = useState(
    typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
  );

  // Detect iOS Safari (doesn't fire beforeinstallprompt)
  const isIOS = typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) && !('MSStream' in window);

  useEffect(() => {
    if (isInstalled) return;

    // Pick up event captured before mount
    if (_installEvent) setDeferredPrompt(_installEvent);

    const onPromptReady = () => {
      if (_installEvent) setDeferredPrompt(_installEvent);
    };
    const onPrompt = (e) => {
      e.preventDefault();
      _installEvent = e;
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      _installEvent = null;
    };

    window.addEventListener('pwa-prompt-ready', onPromptReady);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-ready', onPromptReady);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [isInstalled]);

  const install = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    _installEvent = null;
    setDeferredPrompt(null);
    return outcome === 'accepted';
  };

  return (
    <PWAContext.Provider value={{
      canInstall: !!deferredPrompt && !isInstalled,
      isIOS,
      isInstalled,
      install,
    }}>
      {children}
    </PWAContext.Provider>
  );
}

export const usePWA = () => useContext(PWAContext);
