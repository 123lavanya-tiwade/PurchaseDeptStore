import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Building,
  DollarSign,
  Bell,
  Sliders,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Settings = () => {
  const {
    settings,
    setSettings,
    resetAllData,
    promptConfirm,
    showToast,
  } = useStore();

  const [formState, setFormState] = useState({ ...settings });
  const [activeTab, setActiveTab] = useState('company'); // 'company', 'currency', 'notifications', 'display'

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSettings(formState);
    showToast('System configuration & company profile saved successfully!');
  };

  const handleReset = () => {
    promptConfirm({
      title: 'Reset Demo Data to Initial Factory State?',
      message:
        'This will restore all default purchase requests, orders, inventory items, and department balances to the initial demonstration dataset.',
      confirmText: 'Reset Demo Data',
      variant: 'danger',
      onConfirm: () => {
        resetAllData();
        setFormState({ ...settings });
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2 text-blue-600" />
            System Configuration & Preferences
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Customize enterprise legal metadata, currency conventions, automated approval rules, and store defaults.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
          <button
            type="submit"
            form="settings-form"
            className="flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 flex space-x-1 max-w-2xl text-xs sm:text-sm font-semibold">
        {[
          { id: 'company', label: 'Company Profile', icon: Building },
          { id: 'currency', label: 'Currency & Fiscal', icon: DollarSign },
          { id: 'notifications', label: 'Approval Rules', icon: Bell },
          { id: 'display', label: 'Display Settings', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 mr-1.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Form */}
      <form id="settings-form" onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
        {/* --- COMPANY PROFILE TAB --- */}
        {activeTab === 'company' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Corporate Entity Profile</h3>
              <p className="text-xs text-slate-500">Legal entity information displayed on Purchase Orders and GRN documents</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Registered Name</label>
                <input
                  type="text"
                  value={formState.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Store / System Header Name</label>
                <input
                  type="text"
                  value={formState.shortName}
                  onChange={(e) => handleInputChange('shortName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN (Goods and Services Tax ID)</label>
                <input
                  type="text"
                  value={formState.gstin}
                  onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CIN (Corporate Identity Number)</label>
                <input
                  type="text"
                  value={formState.cin}
                  onChange={(e) => handleInputChange('cin', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Works / Factory Address</label>
              <textarea
                rows="2"
                value={formState.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Office Email</label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Central Store Inward Email</label>
                <input
                  type="email"
                  value={formState.storeEmail}
                  onChange={(e) => handleInputChange('storeEmail', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formState.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- CURRENCY & FISCAL TAB --- */}
        {activeTab === 'currency' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Currency & Accounting Standard</h3>
              <p className="text-xs text-slate-500">Configure default valuation currency and active financial reporting cycle</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Symbol</label>
                <select
                  value={formState.currency}
                  onChange={(e) => {
                    const sym = e.target.value;
                    const code = sym === '₹' ? 'INR' : sym === '$' ? 'USD' : sym === '€' ? 'EUR' : 'GBP';
                    setFormState({ ...formState, currency: sym, currencyCode: code });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="₹">₹ - Indian Rupee (INR)</option>
                  <option value="$">$ - US Dollar (USD)</option>
                  <option value="€">€ - Euro (EUR)</option>
                  <option value="£">£ - British Pound (GBP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Code</label>
                <input
                  type="text"
                  readOnly
                  value={formState.currencyCode}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fiscal Accounting Cycle</label>
                <input
                  type="text"
                  value={formState.fiscalYear}
                  onChange={(e) => handleInputChange('fiscalYear', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- APPROVAL RULES TAB --- */}
        {activeTab === 'notifications' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Procurement Governance & Notification Limits</h3>
              <p className="text-xs text-slate-500">Tiered approval thresholds and automated safety alert triggers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manager Auto-Approval Limit ({formState.currency})
                </label>
                <input
                  type="number"
                  min="0"
                  value={formState.autoApprovalLimit}
                  onChange={(e) => handleInputChange('autoApprovalLimit', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Requests below this amount can be fast-tracked without Executive Committee review.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Low Stock Safety Alert Threshold (Units)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formState.lowStockNotifyThreshold}
                  onChange={(e) => handleInputChange('lowStockNotifyThreshold', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Trigger prominent dashboard warnings when stock dips under this unit count.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.emailAlerts}
                  onChange={(e) => handleInputChange('emailAlerts', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-800">
                  Enable automatic email dispatches to department heads upon PR approval
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.smsAlerts}
                  onChange={(e) => handleInputChange('smsAlerts', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-800">
                  Send urgent SMS dispatch alerts for machine breakdown requisitions
                </span>
              </label>
            </div>
          </div>
        )}

        {/* --- DISPLAY SETTINGS TAB --- */}
        {activeTab === 'display' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Interface & Table Preferences</h3>
              <p className="text-xs text-slate-500">Fine-tune dashboard table densities and pagination sizes</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Records Per Table Page</label>
                <select
                  value={formState.itemsPerPage}
                  onChange={(e) => handleInputChange('itemsPerPage', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value={5}>5 Records</option>
                  <option value={10}>10 Records</option>
                  <option value={20}>20 Records</option>
                  <option value={50}>50 Records</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Color Theme Accent</label>
                <input
                  type="text"
                  readOnly
                  value="Enterprise Slate Navy & Royal Blue"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.compactTableView}
                  onChange={(e) => handleInputChange('compactTableView', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-800">
                  Enable high-density compact row padding in inventory registers
                </span>
              </label>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
