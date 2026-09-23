import React from 'react';
import { useSociety } from '../../context/SocietyContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSociety();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let bgColor = 'bg-white text-slate-800 border-slate-200 shadow-xl';
        let Icon = Info;
        let iconColor = 'text-blue-600';

        if (toast.type === 'success') {
          bgColor = 'bg-white text-slate-900 border-emerald-200 shadow-xl ring-1 ring-emerald-500/10';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-600';
        } else if (toast.type === 'error') {
          bgColor = 'bg-white text-slate-900 border-red-200 shadow-xl ring-1 ring-red-500/10';
          Icon = AlertCircle;
          iconColor = 'text-red-600';
        } else if (toast.type === 'warning') {
          bgColor = 'bg-white text-slate-900 border-amber-200 shadow-xl ring-1 ring-amber-500/10';
          Icon = AlertTriangle;
          iconColor = 'text-amber-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-3 ${bgColor}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-none mb-1 text-slate-900">{toast.title}</p>
              <p className="text-xs text-slate-600 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
