import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue', // blue, amber, emerald, indigo, rose, purple
  trend,
  trendType = 'up', // up, down, neutral, alert
  onClick,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'hover:border-blue-300',
      badge: 'bg-blue-100 text-blue-700',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-300',
      badge: 'bg-amber-100 text-amber-800',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-300',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'hover:border-rose-300',
      badge: 'bg-rose-100 text-rose-800',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'hover:border-indigo-300',
      badge: 'bg-indigo-100 text-indigo-800',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'hover:border-purple-300',
      badge: 'bg-purple-100 text-purple-800',
    },
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 ' + currentTheme.border : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1 pr-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{value}</div>
        </div>
        <div className={`p-3 rounded-xl ${currentTheme.bg} flex-shrink-0 shadow-inner`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded font-medium ${
                trendType === 'alert'
                  ? 'bg-rose-100 text-rose-700 font-semibold'
                  : currentTheme.badge
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
