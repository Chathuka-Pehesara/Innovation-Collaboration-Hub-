import React from "react";

type EmptyStateProps = {
  title: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
};

export default function EmptyState({
  title,
  message,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center fade-in-up">
      <div className="w-20 h-20 mb-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">{message}</p>
      {onAction && actionText && (
        <button onClick={onAction} className="btn-primary px-6 py-2.5">
          {actionText}
        </button>
      )}
    </div>
  );
}

