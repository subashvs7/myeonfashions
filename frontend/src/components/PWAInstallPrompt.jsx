import { useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '../contexts/PWAContext';

export default function PWAInstallPrompt() {
  const { canInstall, install } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  const handleInstall = async () => {
    const accepted = await install();
    if (!accepted) setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-3 right-3 md:left-auto md:right-5 md:w-80 z-50
                    bg-brand-primary text-white shadow-2xl flex items-center gap-3 p-4">
      <div className="flex-shrink-0 bg-brand-accent/20 p-2">
        <Smartphone size={20} className="text-brand-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight">Install Myeon Casuals</p>
        <p className="text-xs text-white/65 mt-0.5 leading-tight">
          Add to home screen — shop faster, offline ready
        </p>
      </div>
      <button
        onClick={handleInstall}
        className="flex-shrink-0 bg-brand-accent hover:bg-amber-500 transition-colors
                   text-white text-xs font-bold px-3 py-2 flex items-center gap-1">
        <Download size={12} />
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-white/50 hover:text-white transition-colors p-1">
        <X size={15} />
      </button>
    </div>
  );
}
