import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg text-sm transition-all duration-200 ${
              isSuccess
                ? 'bg-white dark:bg-slate-900 border-emerald-500/30 text-slate-800 dark:text-slate-100'
                : isError
                ? 'bg-white dark:bg-slate-900 border-red-500/30 text-slate-800 dark:text-slate-100'
                : 'bg-white dark:bg-slate-900 border-blue-500/30 text-slate-800 dark:text-slate-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : isError ? (
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              ) : (
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div className="flex-1 min-w-0 font-normal leading-snug break-words">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
