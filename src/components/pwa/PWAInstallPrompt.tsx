import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

const DISMISS_KEY = 'krisha-crm-pwa-install-dismissed';

const isRunningAsInstalledApp = () => {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  );
};

const wasDismissedThisSession = () => {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
};

const dismissForThisSession = () => {
  try {
    sessionStorage.setItem(DISMISS_KEY, 'true');
  } catch {
    // Storage can be unavailable in some private-browsing configurations.
  }
};

/**
 * Chrome only exposes the native install dialog after the app is installable.
 * This component keeps that browser event and opens it from an explicit user tap.
 */
export const PWAInstallPrompt: React.FC = () => {
  const { showToast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();

      if (!isRunningAsInstalledApp() && !wasDismissedThisSession()) {
        setDeferredPrompt(installEvent);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      showToast('Krisha Tech CRM was installed successfully.', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showToast]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } catch {
      showToast('The install dialog could not be opened. Please try again from Chrome.', 'error');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    dismissForThisSession();
    setDeferredPrompt(null);
  };

  if (!deferredPrompt || isRunningAsInstalledApp()) return null;

  return (
    <aside
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-md rounded-2xl border border-indigo-400/35 bg-slate-900/95 p-3.5 shadow-2xl shadow-indigo-950/60 backdrop-blur-md sm:bottom-6"
      aria-label="Install Krisha Tech CRM"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-400/30">
          <Smartphone className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">Install Krisha Tech CRM</p>
          <p className="mt-0.5 text-xs leading-5 text-slate-300">
            Add it to your phone for a full-screen, app-like experience.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="-mr-1 -mt-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          aria-label="Not now"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleInstall}
        disabled={isInstalling}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:from-brand-500 hover:to-indigo-500 disabled:cursor-wait disabled:opacity-70"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        <span>{isInstalling ? 'Opening install dialog…' : 'Install app'}</span>
      </button>
    </aside>
  );
};
