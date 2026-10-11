import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/Toast';
import { ConfirmDialog } from './components/common/ConfirmDialog';

// Import All 10 Application Pages
import { Dashboard } from './pages/Dashboard';
import { PurchaseRequests } from './pages/PurchaseRequests';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { Suppliers } from './pages/Suppliers';
import { StoreInventory } from './pages/StoreInventory';
import { StockTransactions } from './pages/StockTransactions';
import { GoodsReceipt } from './pages/GoodsReceipt';
import { Departments } from './pages/Departments';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const AppContent = () => {
  const { activePage, sidebarCollapsed, settings } = useStore();

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'purchase-requests':
        return <PurchaseRequests />;
      case 'purchase-orders':
        return <PurchaseOrders />;
      case 'suppliers':
        return <Suppliers />;
      case 'inventory':
        return <StoreInventory />;
      case 'transactions':
        return <StockTransactions />;
      case 'grn':
        return <GoodsReceipt />;
      case 'departments':
        return <Departments />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {/* Navy Sidebar */}
      <Sidebar />

      {/* Main Container Area with dynamic left offset for sidebar */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {renderActivePage()}
        </main>

        {/* Professional Enterprise Footer */}
        <footer className="border-t border-slate-200/80 bg-white/70 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 no-print">
          <div>
            <span className="font-semibold text-slate-700">{settings.companyName}</span> • Central Store & Procurement Division
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Client Storage Active
            </span>
            <span>ERP Build v2.6.4</span>
          </div>
        </footer>
      </div>

      {/* Global Notifications and Confirmation Overlays */}
      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
