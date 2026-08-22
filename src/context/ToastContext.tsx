import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', durationMs: number = 4500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (durationMs > 0) {
      setTimeout(() => {
        removeToast(id);
      }, durationMs);
    }
  }, [removeToast]);

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const borderColor = isSuccess
            ? 'border-emerald-300'
            : isError
            ? 'border-rose-300'
            : isWarning
            ? 'border-amber-300'
            : 'border-blue-300';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start justify-between p-4 rounded-2xl bg-white/95 border ${borderColor} backdrop-blur-2xl shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-3 fade-in group relative overflow-hidden`}
            >
              <div className="flex items-start space-x-3 relative z-10">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}

                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block">
                    {toast.type}
                  </span>
                  <p className="text-xs font-sans text-neutral-900 leading-relaxed pr-2 font-medium">
                    {toast.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-black p-1 rounded-lg hover:bg-neutral-100 transition-colors shrink-0 relative z-10"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
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
