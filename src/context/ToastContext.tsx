import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type ToastFn = {
  (message: string, type?: 'success' | 'error' | 'info'): void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
};

interface ToastContextType {
  toast: ToastFn;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastHandler: any = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    addToast(type, message);
  };
  toastHandler.success = (msg: string) => addToast('success', msg);
  toastHandler.error = (msg: string) => addToast('error', msg);
  toastHandler.info = (msg: string) => addToast('info', msg);

  return (
    <ToastContext.Provider value={{ toast: toastHandler as ToastFn, showToast: toastHandler }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-center justify-between gap-3 text-xs font-medium animate-in slide-in-from-bottom duration-200 ${
              t.type === 'success'
                ? 'bg-zinc-900 border-emerald-500/30 text-emerald-300'
                : t.type === 'error'
                ? 'bg-zinc-900 border-rose-500/30 text-rose-300'
                : 'bg-zinc-900 border-zinc-700 text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
              <span className="leading-snug">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-400 hover:text-zinc-200 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
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
