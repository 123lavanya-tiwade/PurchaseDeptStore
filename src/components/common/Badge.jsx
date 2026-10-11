import React from 'react';

export const Badge = ({ status, variant, className = '' }) => {
  // Determine variant automatically from status string if not specified
  const getBadgeStyle = () => {
    if (variant) {
      switch (variant) {
        case 'success':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'warning':
          return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'danger':
          return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'info':
          return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'purple':
          return 'bg-purple-50 text-purple-700 border-purple-200';
        default:
          return 'bg-slate-100 text-slate-700 border-slate-200';
      }
    }

    const s = String(status || '').toLowerCase();

    // Priority
    if (s === 'urgent') return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
    if (s === 'high') return 'bg-amber-100 text-amber-800 border-amber-300';
    if (s === 'medium') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'low') return 'bg-slate-100 text-slate-700 border-slate-200';

    // Statuses
    if (['approved', 'completed', 'in stock', 'active', 'accepted', 'paid'].includes(s)) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (['pending approval', 'pending', 'low stock', 'partially received', 'under inspection', 'partial', 'in transit'].includes(s)) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (['rejected', 'out of stock', 'inactive', 'cancelled'].includes(s)) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (['po created', 'issued', 'stock in'].includes(s)) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (['draft', 'adjustment'].includes(s)) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (s === 'stock out') {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }

    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {status}
    </span>
  );
};
