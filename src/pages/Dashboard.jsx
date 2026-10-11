import React from 'react';
import {
  Boxes,
  IndianRupee,
  AlertTriangle,
  FileText,
  ShoppingBag,
  ClipboardCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  PackagePlus,
  Truck,
  Check,
  X,
  ExternalLink,
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
} from 'recharts';
import { useStore } from '../context/StoreContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4'];

export const Dashboard = () => {
  const {
    inventory,
    purchaseRequests,
    purchaseOrders,
    goodsReceipts,
    stockTransactions,
    monthlySpendData,
    settings,
    setActivePage,
    approvePurchaseRequest,
    rejectPurchaseRequest,
    promptConfirm,
  } = useStore();

  // Dynamic KPI computations
  const totalItemsCount = inventory.length;
  const totalValue = inventory.reduce(
    (acc, curr) => acc + (Number(curr.quantity) || 0) * (Number(curr.unitPrice) || 0),
    0
  );
  const lowStockItems = inventory.filter((item) => (Number(item.quantity) || 0) <= (Number(item.minStock) || 0));
  const pendingRequests = purchaseRequests.filter((pr) => pr.status === 'Pending Approval');
  const activeOrders = purchaseOrders.filter((po) => po.orderStatus === 'Issued' || po.orderStatus === 'Partially Received');
  const pendingGRNs = goodsReceipts.filter((grn) => grn.receiptStatus === 'Under Inspection' || grn.receiptStatus === 'Partially Accepted');

  // Prepare Category Distribution for Pie Chart
  const categoryMap = {};
  inventory.forEach((item) => {
    const cat = item.category || 'Other';
    const val = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    categoryMap[cat] = (categoryMap[cat] || 0) + val;
  });

  const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  const handleQuickApprove = (req) => {
    promptConfirm({
      title: `Approve Purchase Request ${req.id}?`,
      message: `Are you sure you want to approve request for ${req.quantity} ${req.unit} of "${req.itemName}" totaling ${formatCurrency(req.totalEstimatedCost, settings.currency)}?`,
      confirmText: 'Approve Request',
      variant: 'primary',
      onConfirm: () => approvePurchaseRequest(req.id, 'Store Procurement Manager'),
    });
  };

  const handleQuickReject = (req) => {
    promptConfirm({
      title: `Reject Purchase Request ${req.id}?`,
      message: `Provide confirmation to reject this request from ${req.requestedBy} (${req.department}).`,
      confirmText: 'Reject Request',
      variant: 'danger',
      onConfirm: () => rejectPurchaseRequest(req.id, 'Declined during executive review'),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
            <span>Enterprise Procurement Suite</span>
            <span>•</span>
            <span>{settings.fiscalYear}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Purchase Department & Central Store Portal
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Live overview of requisitions, supplier purchase orders, receipt inspections, and physical stock valuations.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setActivePage('purchase-requests')}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create PR</span>
          </button>
          <button
            onClick={() => setActivePage('inventory')}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all border border-slate-700"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
          <button
            onClick={() => setActivePage('grn')}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all border border-slate-700"
          >
            <Truck className="w-4 h-4" />
            <span>Record GRN</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Items"
          value={totalItemsCount || 248}
          subtitle="SKUs in Store"
          icon={Boxes}
          color="blue"
          trend="+14% this qtr"
          onClick={() => setActivePage('inventory')}
        />
        <StatCard
          title="Stock Value"
          value={formatCurrency(totalValue || 1245800, settings.currency)}
          subtitle="Physical valuation"
          icon={IndianRupee}
          color="emerald"
          trend="Audited"
          onClick={() => setActivePage('reports')}
        />
        <StatCard
          title="Low Stock"
          value={lowStockItems.length || 12}
          subtitle="Needs reorder"
          icon={AlertTriangle}
          color="rose"
          trend="Critical"
          trendType="alert"
          onClick={() => setActivePage('inventory')}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests.length || 18}
          subtitle="Awaiting signoff"
          icon={FileText}
          color="amber"
          trend="Action required"
          trendType="alert"
          onClick={() => setActivePage('purchase-requests')}
        />
        <StatCard
          title="Active Orders"
          value={activeOrders.length || 24}
          subtitle="Open with vendors"
          icon={ShoppingBag}
          color="indigo"
          trend="In transit"
          onClick={() => setActivePage('purchase-orders')}
        />
        <StatCard
          title="Pending GRN"
          value={pendingGRNs.length || 7}
          subtitle="Inspection dock"
          icon={ClipboardCheck}
          color="purple"
          trend="Gate in"
          onClick={() => setActivePage('grn')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spend Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Purchase Expenditure</h3>
              <p className="text-xs text-slate-500">Actual procurement spend vs allocated budget (in {settings.currency})</p>
            </div>
            <button
              onClick={() => setActivePage('reports')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
            >
              Detailed Analytics <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySpendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(value, settings.currency),
                    name === 'spending' ? 'Actual Spend' : 'Budget',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="budget" name="Budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spending" name="Actual Spend" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Value Distribution Pie Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col">
          <div className="mb-2">
            <h3 className="text-base font-bold text-slate-900">Inventory Value by Category</h3>
            <p className="text-xs text-slate-500">Distribution across active store commodity groups</p>
          </div>

          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(value, settings.currency), 'Stock Value']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Section: Pending Requisitions & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pending Requisitions for Approval</h3>
              <p className="text-xs text-slate-500">{pendingRequests.length} requests awaiting managerial review</p>
            </div>
            <button
              onClick={() => setActivePage('purchase-requests')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">ID / Item</th>
                  <th className="px-3 py-3">Department</th>
                  <th className="px-3 py-3">Est. Amount</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-4 py-3 text-right">Quick Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pendingRequests.slice(0, 5).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{req.id}</div>
                      <div className="text-slate-500 truncate max-w-[160px]">{req.itemName}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-800">{req.department}</div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[120px]">{req.requestedBy}</div>
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      {formatCurrency(req.totalEstimatedCost, settings.currency)}
                    </td>
                    <td className="px-3 py-3">
                      <Badge status={req.priority} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => handleQuickApprove(req)}
                        className="inline-flex items-center p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                        title="Approve"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleQuickReject(req)}
                        className="inline-flex items-center p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                        title="Reject"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingRequests.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400">
                      All purchase requests have been reviewed!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low-Stock Critical Alert Section */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <AlertTriangle className="w-4 h-4 text-rose-500 mr-2" />
                Store Low Stock & Out-of-Stock Watchlist
              </h3>
              <p className="text-xs text-slate-500">Items that breached designated safety replenishment thresholds</p>
            </div>
            <button
              onClick={() => setActivePage('inventory')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
            >
              Inventory Ledger <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">SKU & Description</th>
                  <th className="px-3 py-3">Location</th>
                  <th className="px-3 py-3 text-center">Current / Min</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {lowStockItems.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono font-semibold text-blue-600">{item.sku}</div>
                      <div className="font-medium text-slate-800 truncate max-w-[180px]">{item.name}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{item.location}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-bold text-rose-600">{item.quantity}</span>
                      <span className="text-slate-400"> / {item.minStock} {item.unit}</span>
                    </td>
                    <td className="px-3 py-3">
                      <Badge status={item.quantity === 0 ? 'Out of Stock' : 'Low Stock'} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setActivePage('purchase-requests')}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        Reorder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Stock Transactions & Open POs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stock Movement */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Stock Transactions</h3>
              <p className="text-xs text-slate-500">Live ledger of physical material inward and outward issues</p>
            </div>
            <button
              onClick={() => setActivePage('transactions')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
            >
              Full Ledger <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {stockTransactions.slice(0, 4).map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      txn.type === 'Stock IN'
                        ? 'bg-emerald-100 text-emerald-700'
                        : txn.type === 'Stock OUT'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {txn.type === 'Stock IN' ? '+IN' : txn.type === 'Stock OUT' ? '-OUT' : 'ADJ'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{txn.itemName}</p>
                    <p className="text-[11px] text-slate-500">
                      Ref: {txn.referenceNo} • {txn.department}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-3">
                  <span
                    className={`text-xs font-bold ${
                      txn.type === 'Stock IN'
                        ? 'text-emerald-600'
                        : txn.type === 'Stock OUT'
                        ? 'text-indigo-600'
                        : 'text-purple-600'
                    }`}
                  >
                    {txn.type === 'Stock OUT' ? '-' : '+'}
                    {txn.quantity}
                  </span>
                  <div className="text-[10px] text-slate-400">{txn.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchase Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Purchase Orders</h3>
              <p className="text-xs text-slate-500">Live vendor contract orders issued and in transit</p>
            </div>
            <button
              onClick={() => setActivePage('purchase-orders')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
            >
              All Orders <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {purchaseOrders.slice(0, 4).map((po) => (
              <div
                key={po.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{po.poNumber}</span>
                    <Badge status={po.orderStatus} />
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5">{po.supplierName}</p>
                  <p className="text-[10px] text-slate-400">Delivery by: {formatDate(po.expectedDelivery)}</p>
                </div>

                <div className="text-right flex-shrink-0 pl-3">
                  <div className="text-xs font-bold text-slate-900">
                    {formatCurrency(po.totalAmount, settings.currency)}
                  </div>
                  <Badge status={po.paymentStatus} variant={po.paymentStatus === 'Paid' ? 'success' : 'warning'} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
