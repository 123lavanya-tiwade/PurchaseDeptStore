import React from 'react';
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Users,
  Boxes,
  ArrowLeftRight,
  ClipboardCheck,
  Building2,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Sidebar = () => {
  const {
    activePage,
    setActivePage,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    pendingPRCount,
    activePOCount,
    lowStockCount,
    pendingGRNCount,
    settings,
  } = useStore();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'purchase-requests', label: 'Purchase Requests', icon: FileText, badge: pendingPRCount, badgeColor: 'bg-amber-500' },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingBag, badge: activePOCount, badgeColor: 'bg-blue-500' },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'inventory', label: 'Store Inventory', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : null, badgeColor: 'bg-rose-500' },
    { id: 'transactions', label: 'Stock Transactions', icon: ArrowLeftRight },
    { id: 'grn', label: 'Goods Receipt (GRN)', icon: ClipboardCheck, badge: pendingGRNCount > 0 ? pendingGRNCount : null, badgeColor: 'bg-amber-500' },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
              <Store className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white tracking-tight truncate">
                  {settings.shortName || 'NexStore ERP'}
                </span>
                <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">
                  Procure & Inventory
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          <div className="text-[11px] font-semibold text-slate-400/80 uppercase px-3 mb-2 tracking-wider">
            {!sidebarCollapsed ? 'Core Modules' : '• • •'}
          </div>

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center group relative px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />

                {!sidebarCollapsed && (
                  <span className="ml-3 truncate text-left flex-1">{item.label}</span>
                )}

                {/* Badge */}
                {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                  <span
                    className={`ml-auto px-1.5 py-0.5 text-[11px] font-bold rounded-full text-white ${
                      item.badgeColor || 'bg-blue-500'
                    } ${sidebarCollapsed ? 'absolute top-1.5 right-1.5 w-2 h-2 p-0 rounded-full' : ''}`}
                  >
                    {!sidebarCollapsed && item.badge}
                  </span>
                )}

                {/* Subtle active indicator stripe */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-md lg:hidden" />
                )}
              </button>
            );
          })}
        </div>

        {/* User / Org Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/30">
          <div
            className={`flex items-center rounded-xl p-2 bg-slate-800/50 hover:bg-slate-800 transition-colors ${
              sidebarCollapsed ? 'justify-center' : 'space-x-3'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs flex-shrink-0">
              AM
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate flex items-center">
                  Anil More
                  <ShieldCheck className="w-3 h-3 text-emerald-400 ml-1 inline" />
                </div>
                <div className="text-[10px] text-slate-400 truncate">Store Manager</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
