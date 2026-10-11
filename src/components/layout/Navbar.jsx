import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  Plus,
  RotateCcw,
  Search,
  Building,
  Package,
  FilePlus,
  ArrowDownToLine,
  CheckCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Navbar = () => {
  const {
    activePage,
    setActivePage,
    mobileMenuOpen,
    setMobileMenuOpen,
    settings,
    resetAllData,
    promptConfirm,
    lowStockItems,
    pendingPRCount,
    purchaseRequests,
  } = useStore();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const notifRef = useRef(null);
  const quickRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (quickRef.current && !quickRef.current.contains(e.target)) {
        setQuickActionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Executive Overview & KPIs';
      case 'purchase-requests':
        return 'Purchase Requisitions & Approvals';
      case 'purchase-orders':
        return 'Purchase Orders (PO) Management';
      case 'suppliers':
        return 'Approved Vendor Directory';
      case 'inventory':
        return 'Central Store Inventory Ledger';
      case 'transactions':
        return 'Stock Movement Audit Ledger';
      case 'grn':
        return 'Goods Receipt Note (GRN) Inward';
      case 'departments':
        return 'Department Inventory & Budgets';
      case 'reports':
        return 'Analytics & Expenditure Reports';
      case 'settings':
        return 'Store & System Settings';
      default:
        return 'Store Inventory ERP';
    }
  };

  const handleResetClick = () => {
    promptConfirm({
      title: 'Reset Demo Data to Initial Factory State?',
      message:
        'This will reset all purchase requests, purchase orders, inventory counts, and transactions back to the original demo dataset. Any temporary changes you made will be refreshed.',
      confirmText: 'Reset Demo Data',
      variant: 'warning',
      onConfirm: resetAllData,
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Page Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>{settings.companyName}</span>
            <span>/</span>
            <span className="capitalize font-medium text-slate-600">{activePage.replace('-', ' ')}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Currency Tag */}
        <div className="hidden md:flex items-center px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
          <span className="text-blue-600 mr-1.5">{settings.currency}</span> {settings.currencyCode} (FY 26-27)
        </div>

        {/* Quick Action Dropdown */}
        <div className="relative" ref={quickRef}>
          <button
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Action</span>
          </button>

          {quickActionOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 text-xs sm:text-sm animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 font-bold uppercase text-[10px] text-slate-400 tracking-wider">
                Create & Record
              </div>
              <button
                onClick={() => {
                  setActivePage('purchase-requests');
                  setQuickActionOpen(false);
                }}
                className="w-full flex items-center px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <FilePlus className="w-4 h-4 mr-2.5 text-blue-600" />
                New Purchase Request
              </button>
              <button
                onClick={() => {
                  setActivePage('transactions');
                  setQuickActionOpen(false);
                }}
                className="w-full flex items-center px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <ArrowDownToLine className="w-4 h-4 mr-2.5 text-emerald-600" />
                Record Stock Movement
              </button>
              <button
                onClick={() => {
                  setActivePage('grn');
                  setQuickActionOpen(false);
                }}
                className="w-full flex items-center px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2.5 text-amber-600" />
                Receive Goods (GRN)
              </button>
              <button
                onClick={() => {
                  setActivePage('inventory');
                  setQuickActionOpen(false);
                }}
                className="w-full flex items-center px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <Package className="w-4 h-4 mr-2.5 text-purple-600" />
                Add Inventory Item
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {(lowStockItems.length > 0 || pendingPRCount > 0) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <span className="font-semibold text-xs sm:text-sm text-slate-900">Notifications & Alerts</span>
                <span className="text-[11px] bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                  {lowStockItems.length + pendingPRCount} New
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                {lowStockItems.length > 0 && (
                  <div
                    onClick={() => {
                      setActivePage('inventory');
                      setNotificationsOpen(false);
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-start space-x-3"
                  >
                    <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 flex-shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">
                        {lowStockItems.length} items reached low / out of stock
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {lowStockItems[0]?.name} ({lowStockItems[0]?.quantity} remaining)
                      </div>
                    </div>
                  </div>
                )}

                {pendingPRCount > 0 && (
                  <div
                    onClick={() => {
                      setActivePage('purchase-requests');
                      setNotificationsOpen(false);
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-start space-x-3"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">
                        {pendingPRCount} Purchase Requisitions awaiting approval
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Latest: {purchaseRequests.find(pr => pr.status === 'Pending Approval')?.itemName}
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 hover:bg-slate-50 cursor-pointer flex items-start space-x-3">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 flex-shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">Daily store audit ledger synchronized</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Central store inventory balance verified</div>
                  </div>
                </div>
              </div>
              <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50">
                <button
                  onClick={() => {
                    setActivePage('reports');
                    setNotificationsOpen(false);
                  }}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  View comprehensive reports & audit logs
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data button */}
        <button
          onClick={handleResetClick}
          className="flex items-center space-x-1 p-2 sm:px-2.5 sm:py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          title="Reset sample data"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Reset Demo</span>
        </button>
      </div>
    </header>
  );
};
