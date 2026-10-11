import React from 'react';
import { PackageOpen, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There are no items to display matching your criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 my-4">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
