import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Layers,
  MapPin,
  IndianRupee,
  PackageCheck,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, getStockStatus, exportToCSV } from '../utils/formatters';

export const StoreInventory = () => {
  const {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    recordTransaction,
    promptConfirm,
    settings,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isQuickTxnOpen, setIsQuickTxnOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  // Quick Stock Adjustment Form
  const [quickTxnType, setQuickTxnType] = useState('Stock IN');
  const [quickTxnQty, setQuickTxnQty] = useState(10);
  const [quickTxnNotes, setQuickTxnNotes] = useState('Direct store adjustment');

  // Add Item Form State
  const defaultItemForm = {
    sku: '',
    name: '',
    category: 'Mechanical & Spares',
    unit: 'Pcs',
    quantity: 10,
    minStock: 5,
    unitPrice: 100,
    location: 'Rack A-01 / Bin 01',
    description: '',
  };
  const [formData, setFormData] = useState(defaultItemForm);

  // Categories list extracted dynamically
  const categories = useMemo(() => {
    const set = new Set(inventory.map((i) => i.category));
    return Array.from(set).filter(Boolean);
  }, [inventory]);

  // Filtered Inventory Data
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchSearch =
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

      const currentStatus = getStockStatus(item.quantity, item.minStock);
      const matchStatus = statusFilter === 'ALL' || currentStatus === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [inventory, searchTerm, categoryFilter, statusFilter]);

  // Paginated Inventory
  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredInventory.slice(startIndex, startIndex + pageSize);
  }, [filteredInventory, currentPage, pageSize]);

  // Metrics
  const totalValuation = useMemo(() => {
    return inventory.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
  }, [inventory]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.sku || !formData.name) {
      alert('SKU and Item Name are required');
      return;
    }
    addInventoryItem(formData);
    setIsAddModalOpen(false);
    setFormData(defaultItemForm);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!activeItem) return;
    updateInventoryItem(activeItem.id, activeItem);
    setIsEditModalOpen(false);
  };

  const handleQuickTxnSubmit = (e) => {
    e.preventDefault();
    if (!activeItem) return;

    recordTransaction({
      sku: activeItem.sku,
      type: quickTxnType,
      quantity: quickTxnQty,
      referenceNo: 'MANUAL-BIN-ADJ',
      department: 'Central Store',
      performedBy: 'Store Keeper',
      notes: quickTxnNotes,
    });
    setIsQuickTxnOpen(false);
  };

  const handleDelete = (item) => {
    promptConfirm({
      title: `Delete Item ${item.name}?`,
      message: `Are you sure you want to delete SKU ${item.sku}? This item will be removed from stock registers.`,
      confirmText: 'Delete SKU',
      variant: 'danger',
      onConfirm: () => deleteInventoryItem(item.id),
    });
  };

  const handleExportCSV = () => {
    const exportData = filteredInventory.map((item) => ({
      ...item,
      totalStockValue: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      stockStatus: getStockStatus(item.quantity, item.minStock),
    }));

    exportToCSV('central_store_inventory', exportData, {
      sku: 'SKU Code',
      name: 'Item Description',
      category: 'Category',
      quantity: 'Available Quantity',
      unit: 'Unit of Measure',
      minStock: 'Safety Stock Limit',
      unitPrice: 'Unit Price (INR)',
      totalStockValue: 'Total Valuation',
      location: 'Storage Location / Bin',
      stockStatus: 'Stock Status',
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <Boxes className="w-5 h-5 mr-2 text-blue-600" />
            Central Store Inventory Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time tracking of on-hand bin balances, safety buffers, valuations, and storage coordinates.
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
              setFormData(defaultItemForm);
              setIsAddModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Inventory Item</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total SKUs</span>
          <span className="text-xl font-extrabold text-slate-900">{inventory.length}</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Inventory Value</span>
          <span className="text-xl font-extrabold text-blue-600">{formatCurrency(totalValuation, settings.currency)}</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Low Stock Alerts</span>
          <span className="text-xl font-extrabold text-amber-600">
            {inventory.filter((i) => getStockStatus(i.quantity, i.minStock) === 'Low Stock').length}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Out of Stock</span>
          <span className="text-xl font-extrabold text-rose-600">
            {inventory.filter((i) => getStockStatus(i.quantity, i.minStock) === 'Out of Stock').length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU, Item description, or Bin Location..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">SKU Code</th>
                <th className="px-4 py-3.5">Item Name & Commodity</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-3 py-3.5 text-center">Available Stock</th>
                <th className="px-4 py-3.5 text-right">Unit Price</th>
                <th className="px-4 py-3.5 text-right">Total Value</th>
                <th className="px-3 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedInventory.map((item) => {
                const stockStatus = getStockStatus(item.quantity, item.minStock);
                const totalVal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

                // Stock buffer indicator percentage (capped at 100%)
                const percentage = Math.min(
                  Math.round(((item.quantity || 0) / (Math.max(item.minStock * 2, 1))) * 100),
                  100
                );

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold font-mono text-blue-600">{item.sku}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 truncate max-w-xs">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.category}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <div className="flex items-center text-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {item.location}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <div className="font-bold text-slate-900">
                        {item.quantity}{' '}
                        <span className="text-[11px] font-normal text-slate-400">{item.unit}</span>
                      </div>
                      {/* Mini visual stock bar */}
                      <div className="w-20 mx-auto mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            stockStatus === 'Out of Stock'
                              ? 'bg-rose-500 w-full'
                              : stockStatus === 'Low Stock'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Min: {item.minStock}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-800">
                      {formatCurrency(item.unitPrice, settings.currency)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(totalVal, settings.currency)}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <Badge status={stockStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1">
                        {/* Quick In/Out button */}
                        <button
                          onClick={() => {
                            setActiveItem(item);
                            setIsQuickTxnOpen(true);
                          }}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Quick Stock Issue / Inward"
                        >
                          <ArrowDownToLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveItem(item);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Item"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveItem(item);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Item"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredInventory.length === 0 && (
            <EmptyState
              title="No items found in inventory"
              description="No catalog items matched your selected search criteria."
              actionLabel="Add Inventory Item"
              onAction={() => setIsAddModalOpen(true)}
            />
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredInventory.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* --- ADD INVENTORY ITEM MODAL --- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Inventory Item"
        subtitle="Register new physical SKU in the central store catalog"
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-inv-form"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
            >
              Save to Catalog
            </button>
          </>
        }
      >
        <form id="add-inv-form" onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU Code *</label>
              <input
                type="text"
                placeholder="e.g. MEC-BRG-7200"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Commodity Category *</label>
              <input
                type="text"
                placeholder="e.g. Mechanical & Spares"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Item Description Name *</label>
            <input
              type="text"
              placeholder="e.g. Tapered Roller Bearing 30205"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Quantity *</label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Safety Stock *</label>
              <input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
              <input
                type="text"
                placeholder="Pcs / Barrels / Units"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Unit Price ({settings.currency}) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Location (Bin / Rack)</label>
              <input
                type="text"
                placeholder="e.g. Rack B-04 / Bin 11"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Specifications / Remarks</label>
            <textarea
              rows="2"
              placeholder="Material grade, tolerance specifications, or manufacturer instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </form>
      </Modal>

      {/* --- EDIT INVENTORY ITEM MODAL --- */}
      {activeItem && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Item: ${activeItem.sku}`}
          subtitle="Update stock locations, unit prices and safety buffers"
          maxWidth="max-w-2xl"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-inv-form"
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
              >
                Save Updates
              </button>
            </>
          }
        >
          <form id="edit-inv-form" onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Item Description</label>
              <input
                type="text"
                value={activeItem.name}
                onChange={(e) => setActiveItem({ ...activeItem, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price ({settings.currency})</label>
                <input
                  type="number"
                  value={activeItem.unitPrice}
                  onChange={(e) => setActiveItem({ ...activeItem, unitPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Safety Stock</label>
                <input
                  type="number"
                  value={activeItem.minStock}
                  onChange={(e) => setActiveItem({ ...activeItem, minStock: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Location Coordinates</label>
              <input
                type="text"
                value={activeItem.location}
                onChange={(e) => setActiveItem({ ...activeItem, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* --- QUICK STOCK ADJUSTMENT / ISSUE MODAL --- */}
      {activeItem && (
        <Modal
          isOpen={isQuickTxnOpen}
          onClose={() => setIsQuickTxnOpen(false)}
          title={`Quick Material Issue / Inward: ${activeItem.name}`}
          subtitle={`Current Available Stock: ${activeItem.quantity} ${activeItem.unit}`}
          maxWidth="max-w-md"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsQuickTxnOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="quick-txn-form"
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
              >
                Execute Transaction
              </button>
            </>
          }
        >
          <form id="quick-txn-form" onSubmit={handleQuickTxnSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQuickTxnType('Stock IN')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    quickTxnType === 'Stock IN'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  + Stock IN (Inward)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTxnType('Stock OUT')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    quickTxnType === 'Stock OUT'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  - Stock OUT (Issue)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity to {quickTxnType === 'Stock IN' ? 'Receive' : 'Issue'} ({activeItem.unit}) *
              </label>
              <input
                type="number"
                min="1"
                max={quickTxnType === 'Stock OUT' ? activeItem.quantity : undefined}
                value={quickTxnQty}
                onChange={(e) => setQuickTxnQty(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
              {quickTxnType === 'Stock OUT' && quickTxnQty > activeItem.quantity && (
                <p className="text-xs text-rose-600 mt-1 font-medium">
                  Warning: Quantity exceeds current available stock ({activeItem.quantity})!
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Note</label>
              <input
                type="text"
                value={quickTxnNotes}
                onChange={(e) => setQuickTxnNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* --- VIEW ITEM DETAILS MODAL --- */}
      {activeItem && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`SKU Details: ${activeItem.sku}`}
          subtitle={activeItem.name}
          maxWidth="max-w-xl"
          footer={
            <button
              type="button"
              onClick={() => setIsViewModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Close
            </button>
          }
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <span className="font-semibold text-slate-900">{activeItem.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Storage Coordinates</span>
                <span className="font-semibold text-slate-900">{activeItem.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Available Stock</span>
                <span className="font-bold text-slate-900">{activeItem.quantity} {activeItem.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Safety Buffer</span>
                <span className="font-semibold text-slate-900">{activeItem.minStock} {activeItem.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Unit Price</span>
                <span className="font-semibold text-slate-900">{formatCurrency(activeItem.unitPrice, settings.currency)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Total Valuation</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(activeItem.quantity * activeItem.unitPrice, settings.currency)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Specification Notes
              </span>
              <p className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
                {activeItem.description || 'Standard industrial specifications conforming to ISO/ISI quality standards.'}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
