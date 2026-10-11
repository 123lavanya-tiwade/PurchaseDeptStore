import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  RotateCcw,
  Search,
  Download,
  Filter,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  Calendar,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { exportToCSV, formatDateTime } from '../utils/formatters';

export const StockTransactions = () => {
  const {
    stockTransactions,
    inventory,
    departments,
    recordTransaction,
    settings,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTxnType, setSelectedTxnType] = useState('Stock OUT'); // Stock IN, Stock OUT, Adjustment

  // Transaction Form State
  const [formData, setFormData] = useState({
    sku: inventory[0]?.sku || '',
    quantity: 1,
    referenceNo: '',
    department: 'Operations & Production',
    performedBy: 'Anil More (Store Manager)',
    notes: '',
  });

  const selectedInventoryItem = useMemo(() => {
    return inventory.find((i) => i.sku === formData.sku);
  }, [inventory, formData.sku]);

  const filteredTransactions = useMemo(() => {
    return stockTransactions.filter((txn) => {
      const matchSearch =
        txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.performedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === 'ALL' || txn.type === typeFilter;
      const matchDept = departmentFilter === 'ALL' || txn.department === departmentFilter;

      return matchSearch && matchType && matchDept;
    });
  }, [stockTransactions, searchTerm, typeFilter, departmentFilter]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.sku) {
      alert('Please select an item SKU');
      return;
    }

    const res = recordTransaction({
      sku: formData.sku,
      type: selectedTxnType,
      quantity: Number(formData.quantity),
      referenceNo: formData.referenceNo || `DIRECT-${selectedTxnType.replace(' ', '')}`,
      department: formData.department,
      performedBy: formData.performedBy,
      notes: formData.notes,
    });

    if (res.success) {
      setIsModalOpen(false);
      setFormData({
        sku: inventory[0]?.sku || '',
        quantity: 1,
        referenceNo: '',
        department: 'Operations & Production',
        performedBy: 'Anil More (Store Manager)',
        notes: '',
      });
    }
  };

  const handleExportCSV = () => {
    exportToCSV('stock_transactions_ledger', filteredTransactions, {
      id: 'Transaction ID',
      date: 'Timestamp',
      sku: 'SKU Code',
      itemName: 'Item Description',
      type: 'Movement Type',
      quantity: 'Quantity Moved',
      previousStock: 'Previous Balance',
      newStock: 'New Balance',
      referenceNo: 'Reference Document',
      department: 'Department',
      performedBy: 'Issued/Received By',
      notes: 'Remarks',
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <ArrowLeftRight className="w-5 h-5 mr-2 text-blue-600" />
            Stock Movement & Transaction Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Immutable physical material movement audit log. Immediate inventory balance adjustments with zero negative stock enforcement.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setSelectedTxnType('Stock IN');
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 transition-all"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>+ Stock IN</span>
          </button>
          <button
            onClick={() => {
              setSelectedTxnType('Stock OUT');
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all"
          >
            <ArrowUpFromLine className="w-4 h-4" />
            <span>- Stock OUT</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Item, SKU, Ref No, or Performed By..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Movement Types</option>
            <option value="Stock IN">Stock IN (Inward)</option>
            <option value="Stock OUT">Stock OUT (Issue)</option>
            <option value="Adjustment">Adjustment (Audit)</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Departments</option>
            <option value="Central Store">Central Store</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Txn ID</th>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">SKU & Item Name</th>
                <th className="px-3 py-3.5 text-center">Type</th>
                <th className="px-3 py-3.5 text-center">Moved Qty</th>
                <th className="px-3 py-3.5 text-center">Prev Stock</th>
                <th className="px-3 py-3.5 text-center">New Stock</th>
                <th className="px-4 py-3.5">Reference No</th>
                <th className="px-4 py-3.5">Department & Performer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold font-mono text-slate-900">{txn.id}</td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{txn.date}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900 truncate max-w-xs">{txn.itemName}</div>
                    <div className="text-[11px] font-mono text-blue-600">{txn.sku}</div>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <Badge status={txn.type} />
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <span
                      className={`font-extrabold ${
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
                  </td>
                  <td className="px-3 py-3.5 text-center font-mono text-slate-500">{txn.previousStock}</td>
                  <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                    {txn.newStock}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-700 font-medium">
                    {txn.referenceNo}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-900">{txn.department}</div>
                    <div className="text-slate-400 text-xs flex items-center mt-0.5">
                      <User className="w-3 h-3 mr-1 inline" /> {txn.performedBy}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <EmptyState
              title="No transactions found"
              description="No material movements recorded matching your criteria."
            />
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredTransactions.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* --- RECORD STOCK TRANSACTION MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Record ${selectedTxnType}`}
        subtitle="Live physical movement simulator — immediate catalog stock update"
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="stock-movement-form"
              className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-all ${
                selectedTxnType === 'Stock IN'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  : selectedTxnType === 'Stock OUT'
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
              }`}
            >
              Confirm & Post to Ledger
            </button>
          </>
        }
      >
        <form id="stock-movement-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Movement Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Movement Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['Stock IN', 'Stock OUT', 'Adjustment'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTxnType(t)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    selectedTxnType === t
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Item Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Inventory Item SKU *
            </label>
            <select
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {inventory.map((item) => (
                <option key={item.id} value={item.sku}>
                  [{item.sku}] {item.name} (Current: {item.quantity} {item.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Preview Card */}
          {selectedInventoryItem && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Available In Stock:</span>
                <span className="text-sm font-extrabold text-slate-900">
                  {selectedInventoryItem.quantity} {selectedInventoryItem.unit}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Storage Location:</span>
                <span className="font-semibold text-slate-700">{selectedInventoryItem.location}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                max={
                  selectedTxnType === 'Stock OUT' && selectedInventoryItem
                    ? selectedInventoryItem.quantity
                    : undefined
                }
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {selectedTxnType === 'Stock OUT' &&
                selectedInventoryItem &&
                formData.quantity > selectedInventoryItem.quantity && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    Insufficient stock! Max available is {selectedInventoryItem.quantity}.
                  </p>
                )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reference Document No.
              </label>
              <input
                type="text"
                placeholder="e.g. ISSUE-MNT-412 / PO-2026-002"
                value={formData.referenceNo}
                onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Central Store">Central Store</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Performed By</label>
              <input
                type="text"
                value={formData.performedBy}
                onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Reason</label>
            <textarea
              rows="2"
              placeholder="e.g. Dispatched to line 3 CNC machine breakdown replacement"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
