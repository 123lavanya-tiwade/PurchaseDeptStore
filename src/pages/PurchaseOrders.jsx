import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Download,
  Eye,
  FileCheck,
  Truck,
  Printer,
  Calendar,
  Building2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';

export const PurchaseOrders = () => {
  const {
    purchaseOrders,
    suppliers,
    inventory,
    addPurchaseOrder,
    updatePurchaseOrderStatus,
    updatePurchaseOrderPaymentStatus,
    promptConfirm,
    settings,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [supplierFilter, setSupplierFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activePO, setActivePO] = useState(null);

  // Create PO Form State
  const [newPOSupplier, setNewPOSupplier] = useState(suppliers[0]?.id || '');
  const [newPODelivery, setNewPODelivery] = useState('');
  const [newPOTerms, setNewPOTerms] = useState('Net 30 days from delivery and inspection.');
  const [newPONotes, setNewPONotes] = useState('');
  const [lineItems, setLineItems] = useState([
    { sku: 'MEC-BRG-6205', name: 'Industrial Deep Groove Ball Bearing 6205-2RS', qty: 20, unitPrice: 420 },
  ]);

  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchSearch =
        po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || po.orderStatus === statusFilter;
      const matchPayment = paymentFilter === 'ALL' || po.paymentStatus === paymentFilter;
      const matchSupplier = supplierFilter === 'ALL' || po.supplierId === supplierFilter;

      return matchSearch && matchStatus && matchPayment && matchSupplier;
    });
  }, [purchaseOrders, searchTerm, statusFilter, paymentFilter, supplierFilter]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Line item helpers for Create Modal
  const handleAddLineItem = () => {
    setLineItems([...lineItems, { sku: '', name: '', qty: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (index) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems];
    if (field === 'sku') {
      const selected = inventory.find((i) => i.sku === value);
      if (selected) {
        updated[index] = {
          ...updated[index],
          sku: selected.sku,
          name: selected.name,
          unitPrice: selected.unitPrice,
        };
      } else {
        updated[index].sku = value;
      }
    } else {
      updated[index][field] = value;
    }
    setLineItems(updated);
  };

  const calculateTotalAmount = () => {
    return lineItems.reduce((acc, item) => acc + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0), 0);
  };

  const handleCreatePOSubmit = (e) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === newPOSupplier) || suppliers[0];
    const totalAmount = calculateTotalAmount();

    const formattedItems = lineItems.map((item) => ({
      sku: item.sku,
      name: item.name,
      qty: Number(item.qty),
      unitPrice: Number(item.unitPrice),
      total: Number(item.qty) * Number(item.unitPrice),
    }));

    addPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      expectedDelivery: newPODelivery || new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
      totalAmount,
      items: formattedItems,
      terms: newPOTerms,
      notes: newPONotes,
    });

    setIsCreateModalOpen(false);
    setLineItems([{ sku: 'MEC-BRG-6205', name: 'Industrial Deep Groove Ball Bearing 6205-2RS', qty: 20, unitPrice: 420 }]);
  };

  const handleStatusChange = (po, newStatus) => {
    updatePurchaseOrderStatus(po.id, newStatus);
  };

  const handlePaymentChange = (po, newPayment) => {
    updatePurchaseOrderPaymentStatus(po.id, newPayment);
  };

  const handleExportCSV = () => {
    exportToCSV('purchase_orders', filteredOrders, {
      poNumber: 'PO Number',
      orderDate: 'Order Date',
      supplierName: 'Supplier Name',
      expectedDelivery: 'Expected Delivery',
      totalAmount: 'Total Amount',
      paymentStatus: 'Payment Status',
      orderStatus: 'Order Status',
      terms: 'Payment Terms',
      notes: 'Notes',
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-blue-600" />
            Purchase Orders (PO) Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Official commercial purchase contracts issued to external vendors with delivery and payment tracking.
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
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by PO Number or Vendor Name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Order Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="Issued">Issued</option>
            <option value="Partially Received">Partially Received</option>
            <option value="Completed">Completed</option>
            <option value="Draft">Draft</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Payment Status */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Pending">Pending Payment</option>
            <option value="Partial">Partial Paid</option>
            <option value="Paid">Fully Paid</option>
          </select>

          {/* Supplier */}
          <select
            value={supplierFilter}
            onChange={(e) => {
              setSupplierFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Vendors</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">PO Number</th>
                <th className="px-4 py-3.5">Supplier Name</th>
                <th className="px-4 py-3.5">Order Date</th>
                <th className="px-4 py-3.5">Expected Delivery</th>
                <th className="px-4 py-3.5 text-right">Total Amount</th>
                <th className="px-3 py-3.5 text-center">Payment</th>
                <th className="px-3 py-3.5 text-center">Order Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold font-mono text-slate-900">{po.poNumber}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900 truncate max-w-xs">{po.supplierName}</div>
                    <div className="text-[11px] text-slate-400">
                      {po.items?.length || 1} line item(s) included
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{formatDate(po.orderDate)}</td>
                  <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center text-xs">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                      {formatDate(po.expectedDelivery)}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                    {formatCurrency(po.totalAmount, settings.currency)}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <select
                      value={po.paymentStatus}
                      onChange={(e) => handlePaymentChange(po, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-2.5 py-0.5 border focus:outline-none cursor-pointer ${
                        po.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : po.paymentStatus === 'Partial'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <select
                      value={po.orderStatus}
                      onChange={(e) => handleStatusChange(po, e.target.value)}
                      className="text-xs font-medium rounded-lg px-2 py-1 bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="Issued">Issued</option>
                      <option value="Partially Received">Partially Received</option>
                      <option value="Completed">Completed</option>
                      <option value="Draft">Draft</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setActivePO(po);
                        setIsViewModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View PO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <EmptyState
              title="No purchase orders found"
              description="No orders match your selected search or filter settings."
              actionLabel="Create Purchase Order"
              onAction={() => setIsCreateModalOpen(true)}
            />
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* --- CREATE PURCHASE ORDER MODAL --- */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate Official Purchase Order"
        subtitle="Issue legal procurement order to approved supplier"
        maxWidth="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-po-form"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all"
            >
              Issue Purchase Order
            </button>
          </>
        }
      >
        <form id="create-po-form" onSubmit={handleCreatePOSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Vendor / Supplier *
              </label>
              <select
                value={newPOSupplier}
                onChange={(e) => setNewPOSupplier(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Delivery Date *
              </label>
              <input
                type="date"
                value={newPODelivery}
                onChange={(e) => setNewPODelivery(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Line items section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Order Line Items
              </span>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Another Item
              </button>
            </div>

            <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="col-span-4">
                    <label className="text-[10px] text-slate-400 block">Catalog Item</label>
                    <select
                      value={item.sku}
                      onChange={(e) => handleLineItemChange(index, 'sku', e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none"
                    >
                      <option value="">Select SKU</option>
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.sku}>
                          {inv.sku} - {inv.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <label className="text-[10px] text-slate-400 block">Custom Name</label>
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => handleLineItemChange(index, 'name', e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-400 block">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleLineItemChange(index, 'qty', e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-400 block">Price ({settings.currency})</label>
                    <input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 text-center pt-3">
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(index)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total summary */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-blue-900">Calculated PO Total Amount:</span>
              <span className="text-base font-extrabold text-blue-900">
                {formatCurrency(calculateTotalAmount(), settings.currency)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Commercial Terms & Conditions
              </label>
              <input
                type="text"
                value={newPOTerms}
                onChange={(e) => setNewPOTerms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Delivery Notes & Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Test certificate required with delivery challan"
                value={newPONotes}
                onChange={(e) => setNewPONotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* --- VIEW & PRINT PURCHASE ORDER MODAL --- */}
      {activePO && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Purchase Order: ${activePO.poNumber}`}
          subtitle="Official Commercial Procurement Document"
          maxWidth="max-w-3xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-5 text-xs sm:text-sm">
            {/* Enterprise Header Box */}
            <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-base tracking-tight text-white">{settings.companyName}</h4>
                <p className="text-slate-300 text-xs mt-0.5">{settings.address}</p>
                <p className="text-slate-400 text-[11px]">GSTIN: {settings.gstin} | CIN: {settings.cin}</p>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold">Purchase Order</div>
                <div className="text-lg font-mono font-bold text-white">{activePO.poNumber}</div>
                <div className="text-xs text-slate-300">Date: {formatDate(activePO.orderDate)}</div>
              </div>
            </div>

            {/* Vendor and Delivery Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Vendor Details</span>
                <p className="font-bold text-slate-900 mt-1">{activePO.supplierName}</p>
                <p className="text-slate-600 text-xs mt-0.5">Approved Corporate Supplier</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Destination</span>
                <p className="font-semibold text-slate-900 mt-1">BHPE Central Store & Receipt Dock</p>
                <p className="text-slate-600 text-xs mt-0.5">Expected Delivery: {formatDate(activePO.expectedDelivery)}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Total ({settings.currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {activePO.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 text-slate-400">{idx + 1}</td>
                      <td className="p-2.5 font-medium text-slate-900">
                        {item.name}
                        {item.sku && <span className="block text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>}
                      </td>
                      <td className="p-2.5 text-center font-semibold">{item.qty}</td>
                      <td className="p-2.5 text-right">{formatCurrency(item.unitPrice, settings.currency)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        {formatCurrency(item.total || item.qty * item.unitPrice, settings.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan="4" className="p-3 text-right text-slate-700">Gross Total Amount:</td>
                    <td className="p-3 text-right text-blue-600 font-extrabold text-sm">
                      {formatCurrency(activePO.totalAmount, settings.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Terms and Signatures */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
              <div><strong>Terms:</strong> {activePO.terms || 'Net 30 days.'}</div>
              <div><strong>Remarks:</strong> {activePO.notes || 'None.'}</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
