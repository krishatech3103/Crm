import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="pointer-events-none fixed right-3 top-3 z-[60] flex w-auto max-w-[calc(100vw-1.5rem)] flex-col gap-1.5 sm:right-4 sm:top-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium shadow-xl transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-slate-800 border-emerald-500/30 text-emerald-400'
                : toast.type === 'error'
                ? 'bg-slate-800 border-rose-500/30 text-rose-400'
                : 'bg-slate-800 border-sky-500/30 text-sky-400'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />}
            {toast.type === 'info' && <Info className="h-4 w-4 shrink-0 text-sky-400" />}
            <span className="flex-1 text-slate-100">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 text-slate-400 transition-colors hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
