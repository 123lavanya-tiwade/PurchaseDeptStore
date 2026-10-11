import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useStore();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-emerald-500';
      case 'error':
        return 'border-l-4 border-l-rose-500';
      case 'warning':
        return 'border-l-4 border-l-amber-500';
      default:
        return 'border-l-4 border-l-blue-500';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 ${getBorderColor(
            toast.type
          )} animate-in slide-in-from-bottom-5 duration-200`}
        >
          <div className="flex items-center space-x-3 pr-2">
            {getIcon(toast.type)}
            <p className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
