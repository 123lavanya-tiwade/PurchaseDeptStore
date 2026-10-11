import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  AlertTriangle,
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Package,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useStore } from '../context/StoreContext';
import { Badge } from '../components/common/Badge';
import { formatCurrency, getStockStatus, exportToCSV, formatDate } from '../utils/formatters';

const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const Reports = () => {
  const {
    inventory,
    purchaseOrders,
    suppliers,
    departments,
    monthlySpendData,
    settings,
  } = useStore();

  const [dateRange, setDateRange] = useState('YTD'); // '30D', 'QTD', 'YTD', 'ALL'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'lowstock', 'suppliers', 'departments'

  // 1. Category Distribution
  const categoryChartData = useMemo(() => {
    const map = {};
    inventory.forEach((i) => {
      const cat = i.category || 'General';
      const val = (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0);
      map[cat] = (map[cat] || 0) + val;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  // 2. Department Spending Chart Data
  const departmentSpendData = useMemo(() => {
    return departments.map((d) => ({
      name: d.code,
      fullName: d.name,
      spent: d.spentThisQuarter,
      budget: d.budget,
    }));
  }, [departments]);

  // 3. Supplier Spend Breakdown
  const supplierSpendData = useMemo(() => {
    const map = {};
    purchaseOrders.forEach((po) => {
      map[po.supplierName] = (map[po.supplierName] || 0) + (Number(po.totalAmount) || 0);
    });

    return Object.entries(map)
      .map(([name, totalSpent]) => {
        const sup = suppliers.find((s) => s.name === name);
        const ordersCount = purchaseOrders.filter((po) => po.supplierName === name).length;
        return {
          name,
          category: sup?.category || 'General',
          gstin: sup?.gstin || 'N/A',
          ordersCount,
          totalSpent,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [purchaseOrders, suppliers]);

  // 4. Low Stock Watchlist
  const lowStockReportData = useMemo(() => {
    return inventory
      .filter((i) => (Number(i.quantity) || 0) <= (Number(i.minStock) || 0))
      .map((i) => ({
        ...i,
        deficit: Math.max((i.minStock || 0) - (i.quantity || 0), 0),
        estimatedReorderCost: Math.max((i.minStock || 0) - (i.quantity || 0), 1) * (i.unitPrice || 0),
        stockStatus: getStockStatus(i.quantity, i.minStock),
      }));
  }, [inventory]);

  // CSV Exporters
  const handleExportLowStock = () => {
    exportToCSV('low_stock_report', lowStockReportData, {
      sku: 'SKU Code',
      name: 'Item Description',
      category: 'Category',
      location: 'Bin Location',
      quantity: 'Current On-Hand',
      minStock: 'Safety Threshold',
      deficit: 'Reorder Deficit Qty',
      unitPrice: 'Unit Price',
      estimatedReorderCost: 'Estimated Replenishment Cost',
      stockStatus: 'Status',
    });
  };

  const handleExportSupplierSpend = () => {
    exportToCSV('supplier_procurement_report', supplierSpendData, {
      name: 'Supplier Legal Name',
      category: 'Commodity',
      gstin: 'GSTIN',
      ordersCount: 'Total POs Raised',
      totalSpent: 'Gross Procurement Spend',
    });
  };

  const handleExportDepartmentSpend = () => {
    exportToCSV('department_budget_report', departments, {
      code: 'Cost Center Code',
      name: 'Department Name',
      head: 'Department Head',
      budget: 'Approved Budget (INR)',
      spentThisQuarter: 'Actual Spent (INR)',
      assignedInventoryValue: 'Assigned Asset Value',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Executive Procurement & Inventory Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Audit-ready cost analytics, budget consumption, supplier performance metrics, and safety stock risk reports.
          </p>
        </div>

        {/* Date Filter & Global Report Export */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="30D">Past 30 Days</option>
            <option value="QTD">Quarter to Date (Q3)</option>
            <option value="YTD">Year to Date (FY 2026-27)</option>
            <option value="ALL">All Historical Data</option>
          </select>
        </div>
      </div>

      {/* Tabs Strip */}
      <div className="border-b border-slate-200 bg-white px-4 rounded-xl flex items-center space-x-4 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview Charts
        </button>
        <button
          onClick={() => setActiveTab('lowstock')}
          className={`py-3.5 border-b-2 transition-all whitespace-nowrap flex items-center ${
            activeTab === 'lowstock'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 mr-1 text-rose-500" />
          Low Stock Risk Report ({lowStockReportData.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`py-3.5 border-b-2 transition-all whitespace-nowrap flex items-center ${
            activeTab === 'suppliers'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 mr-1 text-slate-400" />
          Supplier Spend Analysis
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`py-3.5 border-b-2 transition-all whitespace-nowrap flex items-center ${
            activeTab === 'departments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 mr-1 text-slate-400" />
          Department Budget Variance
        </button>
      </div>

      {/* --- TAB 1: OVERVIEW CHARTS --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend Area Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900">Procurement Expenditure Run-Rate</h3>
                <p className="text-xs text-slate-500">6-Month monthly spending volume against allocation caps</p>
              </div>

              <div className="h-72 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySpendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                    />
                    <Tooltip
                      formatter={(val) => [formatCurrency(val, settings.currency), 'Spend']}
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="spending" stroke="#2563eb" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department-wise Spending Bar Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900">Department Cost Center Expenditure</h3>
                <p className="text-xs text-slate-500">Actual consumption vs budgeted threshold per department</p>
              </div>

              <div className="h-72 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentSpendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                    />
                    <Tooltip
                      formatter={(val, name) => [
                        formatCurrency(val, settings.currency),
                        name === 'spent' ? 'Spent This Quarter' : 'Allotted Budget',
                      ]}
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="spent" name="Spent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="budget" name="Budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category Distribution Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Commodity Valuation Breakdown</h3>
                <p className="text-xs text-slate-500">Inventory capital tied up across major categories</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryChartData.map((cat, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{cat.name}</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-2">
                    {formatCurrency(cat.value, settings.currency)}
                  </span>
                  <span className="text-[11px] text-blue-600 mt-1 font-medium">
                    {((cat.value / (categoryChartData.reduce((a, b) => a + b.value, 0) || 1)) * 100).toFixed(1)}% of total stock
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: LOW STOCK REPORT --- */}
      {activeTab === 'lowstock' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <AlertTriangle className="w-5 h-5 text-rose-500 mr-2" />
                Critical Replenishment & Safety Stock Audit
              </h3>
              <p className="text-xs text-slate-500">
                Items requiring emergency purchase orders to prevent assembly line or facility downtime
              </p>
            </div>
            <button
              onClick={handleExportLowStock}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Low Stock Report (CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">SKU Code</th>
                  <th className="px-4 py-3.5">Item Name</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-3 py-3.5 text-center">Available Stock</th>
                  <th className="px-3 py-3.5 text-center">Safety Buffer</th>
                  <th className="px-3 py-3.5 text-center">Reorder Deficit</th>
                  <th className="px-4 py-3.5 text-right">Unit Price</th>
                  <th className="px-4 py-3.5 text-right">Estimated PO Value</th>
                  <th className="px-3 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {lowStockReportData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold font-mono text-blue-600">{item.sku}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3.5 text-slate-500">{item.location}</td>
                    <td className="px-3 py-3.5 text-center font-bold text-rose-600">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-3 py-3.5 text-center text-slate-600">
                      {item.minStock} {item.unit}
                    </td>
                    <td className="px-3 py-3.5 text-center font-bold text-slate-900">
                      +{item.deficit} {item.unit}
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-700">
                      {formatCurrency(item.unitPrice, settings.currency)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-blue-600">
                      {formatCurrency(item.estimatedReorderCost, settings.currency)}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <Badge status={item.stockStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: SUPPLIER SPEND REPORT --- */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900">Vendor Volume & Procurement Expenditure</h3>
              <p className="text-xs text-slate-500">Total contracts issued and cumulative commercial spend per supplier</p>
            </div>
            <button
              onClick={handleExportSupplierSpend}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Supplier Report (CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Vendor Name</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">GSTIN</th>
                  <th className="px-3 py-3.5 text-center">Orders Count</th>
                  <th className="px-4 py-3.5 text-right">Gross Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {supplierSpendData.map((sup, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{sup.name}</td>
                    <td className="px-4 py-3.5 text-slate-600">{sup.category}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">{sup.gstin}</td>
                    <td className="px-3 py-3.5 text-center font-bold text-slate-900">{sup.ordersCount} POs</td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-blue-600 text-sm">
                      {formatCurrency(sup.totalSpent, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: DEPARTMENT BUDGET REPORT --- */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900">Cost Center & Department Budget Tracking</h3>
              <p className="text-xs text-slate-500">Variance between quarterly allocation and actual material requisitions</p>
            </div>
            <button
              onClick={handleExportDepartmentSpend}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Department Report (CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Code</th>
                  <th className="px-4 py-3.5">Department Name</th>
                  <th className="px-4 py-3.5">Head of Dept</th>
                  <th className="px-4 py-3.5 text-right">Quarterly Budget</th>
                  <th className="px-4 py-3.5 text-right">Actual Spent</th>
                  <th className="px-3 py-3.5 text-center">Variance %</th>
                  <th className="px-4 py-3.5 text-right">Assigned Stock Asset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {departments.map((dept) => {
                  const pct = Math.round(((dept.spentThisQuarter || 0) / (dept.budget || 1)) * 100);
                  return (
                    <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold font-mono text-blue-600">{dept.code}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{dept.name}</td>
                      <td className="px-4 py-3.5 text-slate-700">{dept.head}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-600">
                        {formatCurrency(dept.budget, settings.currency)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                        {formatCurrency(dept.spentThisQuarter, settings.currency)}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                            pct > 80 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-blue-600">
                        {formatCurrency(dept.assignedInventoryValue, settings.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
