import React from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ConfirmDialog = () => {
  const { confirmDialog, closeConfirm } = useStore();
  const { isOpen, title, message, confirmText, cancelText, variant, onConfirm } = confirmDialog;

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-rose-600" />,
          iconBg: 'bg-rose-100',
          btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-6 w-6 text-amber-600" />,
          iconBg: 'bg-amber-100',
          btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200',
        };
      case 'primary':
      default:
        return {
          icon: <HelpCircle className="h-6 w-6 text-blue-600" />,
          iconBg: 'bg-blue-100',
          btn: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200',
        };
    }
  };

  const currentVariant = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closeConfirm} />
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-6">
            <div className="flex items-start">
              <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${currentVariant.iconBg} mr-4`}>
                {currentVariant.icon}
              </div>
              <div className="flex-1 mt-0.5">
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{message}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-3.5 flex flex-row-reverse gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onConfirm}
              className={`inline-flex justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${currentVariant.btn}`}
            >
              {confirmText}
            </button>
            <button
              type="button"
              onClick={closeConfirm}
              className="inline-flex justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-100 transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
