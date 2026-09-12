import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, Download, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isDownload = toast.title.toLowerCase().includes('download');

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-[#282828] text-white border border-[#3e3e3e] rounded-lg shadow-2xl transition-all transform translate-y-0"
          >
            <div className="shrink-0">
              {isDownload ? (
                <Download className="w-5 h-5 text-[#1DB954] animate-bounce" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-[#1DB954]" />
              ) : isError ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : (
                <Info className="w-5 h-5 text-[#1DB954]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight truncate">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-[#b3b3b3] mt-0.5 leading-normal">{toast.description}</p>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#a7a7a7] hover:text-white p-1 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
