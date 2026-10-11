import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Plus,
  Search,
  Download,
  Eye,
  CheckCircle,
  AlertTriangle,
  Truck,
  FileText,
  Calendar,
  Building,
  User,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate, exportToCSV } from '../utils/formatters';

export const GoodsReceipt = () => {
  const {
    goodsReceipts,
    purchaseOrders,
    inventory,
    recordGoodsReceipt,
    promptConfirm,
    settings,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeGRN, setActiveGRN] = useState(null);

  // Form State
  const [selectedPO, setSelectedPO] = useState(purchaseOrders[0]?.poNumber || '');
  const [inspectedBy, setInspectedBy] = useState('Harish Pillai (Quality Inspector)');
  const [challanNumber, setChallanNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [receiptStatus, setReceiptStatus] = useState('Accepted');

  // Items to receive based on selected PO
  const [receivedItems, setReceivedItems] = useState([]);

  // When selectedPO changes, prefill items from PO
  const handlePOSelect = (poNum) => {
    setSelectedPO(poNum);
    const po = purchaseOrders.find((p) => p.poNumber === poNum);
    if (po && po.items) {
      setReceivedItems(
        po.items.map((it) => ({
          sku: it.sku || 'MEC-BRG-6205',
          name: it.name,
          orderedQty: it.qty,
          receivedQty: it.qty,
          damagedQty: 0,
          acceptedQty: it.qty,
        }))
      );
    }
  };

  const handleOpenRecordModal = () => {
    const po = purchaseOrders[0];
    if (po) {
      setSelectedPO(po.poNumber);
      if (po.items) {
        setReceivedItems(
          po.items.map((it) => ({
            sku: it.sku || 'MEC-BRG-6205',
            name: it.name,
            orderedQty: it.qty,
            receivedQty: it.qty,
            damagedQty: 0,
            acceptedQty: it.qty,
          }))
        );
      }
    }
    setChallanNumber(`DC-${Math.floor(10000 + Math.random() * 90000)}`);
    setVehicleNumber(`MH-04-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsRecordModalOpen(true);
  };

  const handleItemQtyChange = (index, field, value) => {
    const updated = [...receivedItems];
    const num = Number(value) || 0;
    updated[index][field] = num;

    if (field === 'receivedQty' || field === 'damagedQty') {
      const r = updated[index].receivedQty || 0;
      const d = updated[index].damagedQty || 0;
      updated[index].acceptedQty = Math.max(r - d, 0);
    }

    setReceivedItems(updated);
  };

  const handleSubmitGRN = (e) => {
    e.preventDefault();
    const po = purchaseOrders.find((p) => p.poNumber === selectedPO);

    recordGoodsReceipt({
      poNumber: selectedPO,
      supplierName: po?.supplierName || 'SKF India Precision Bearings Ltd.',
      inspectedBy,
      challanNumber,
      vehicleNumber,
      remarks,
      receiptStatus,
      itemsReceived: receivedItems,
    });

    setIsRecordModalOpen(false);
  };

  const filteredGRNs = useMemo(() => {
    return goodsReceipts.filter((grn) => {
      const matchSearch =
        grn.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grn.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grn.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grn.inspectedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || grn.receiptStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [goodsReceipts, searchTerm, statusFilter]);

  const paginatedGRNs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredGRNs.slice(startIndex, startIndex + pageSize);
  }, [filteredGRNs, currentPage, pageSize]);

  const handleExportCSV = () => {
    exportToCSV('goods_receipt_notes', filteredGRNs, {
      grnNumber: 'GRN Number',
      poNumber: 'PO Number',
      supplierName: 'Supplier',
      receivedDate: 'Received Date',
      totalReceived: 'Total Received Qty',
      totalDamaged: 'Total Damaged Qty',
      receiptStatus: 'Receipt Status',
      inspectedBy: 'Inspector',
      challanNumber: 'Delivery Challan No',
      vehicleNumber: 'Vehicle Number',
      remarks: 'Inspection Remarks',
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <ClipboardCheck className="w-5 h-5 mr-2 text-blue-600" />
            Goods Receipt Note (GRN) Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Dockside receipt, physical quality inspection, damaged goods reconciliation, and inward inventory posting.
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
            onClick={handleOpenRecordModal}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Goods Receipt (GRN)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by GRN Number, PO Number, Supplier, or Inspector..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Receipt Statuses</option>
            <option value="Accepted">Accepted</option>
            <option value="Partially Accepted">Partially Accepted</option>
            <option value="Under Inspection">Under Inspection</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* GRN Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">GRN Number</th>
                <th className="px-4 py-3.5">PO Number</th>
                <th className="px-4 py-3.5">Supplier Name</th>
                <th className="px-4 py-3.5">Received Date</th>
                <th className="px-3 py-3.5 text-center">Received Qty</th>
                <th className="px-3 py-3.5 text-center">Damaged Qty</th>
                <th className="px-3 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Inspector</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedGRNs.map((grn) => (
                <tr key={grn.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold font-mono text-slate-900">{grn.grnNumber}</td>
                  <td className="px-4 py-3.5 font-mono text-blue-600 font-semibold">{grn.poNumber}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-900 truncate max-w-xs">{grn.supplierName}</td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{formatDate(grn.receivedDate)}</td>
                  <td className="px-3 py-3.5 text-center font-bold text-slate-900">{grn.totalReceived}</td>
                  <td className="px-3 py-3.5 text-center font-semibold text-rose-600">
                    {grn.totalDamaged > 0 ? grn.totalDamaged : '0'}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <Badge status={grn.receiptStatus} />
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 text-xs truncate max-w-[150px]">{grn.inspectedBy}</td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setActiveGRN(grn);
                        setIsViewModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View Note
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredGRNs.length === 0 && (
            <EmptyState
              title="No Goods Receipts found"
              description="No inwards matching selected criteria."
              actionLabel="Record Goods Receipt"
              onAction={handleOpenRecordModal}
            />
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredGRNs.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* --- RECORD GOODS RECEIPT (GRN) MODAL --- */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Goods Receipt Note (GRN)"
        subtitle="Dock inwards inspection and automatic store inventory increment"
        maxWidth="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="record-grn-form"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all"
            >
              Post GRN & Update Inventory
            </button>
          </>
        }
      >
        <form id="record-grn-form" onSubmit={handleSubmitGRN} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Purchase Order Reference *
              </label>
              <select
                value={selectedPO}
                onChange={(e) => handlePOSelect(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.poNumber}>
                    {po.poNumber} - {po.supplierName} ({po.orderStatus})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receipt / Inspection Status
              </label>
              <select
                value={receiptStatus}
                onChange={(e) => setReceiptStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Accepted">Accepted (100% Quality Pass)</option>
                <option value="Partially Accepted">Partially Accepted (Damage noted)</option>
                <option value="Under Inspection">Under Inspection (Lab pending)</option>
                <option value="Rejected">Rejected (Non-conformance)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Delivery Challan Number
              </label>
              <input
                type="text"
                placeholder="e.g. DC-99120"
                value={challanNumber}
                onChange={(e) => setChallanNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transport Vehicle Number
              </label>
              <input
                type="text"
                placeholder="e.g. MH-04-GP-3819"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspected By (Staff)
              </label>
              <input
                type="text"
                value={inspectedBy}
                onChange={(e) => setInspectedBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Line items inward verification */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Items Received from Consignment
            </label>
            <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              {receivedItems.map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-xs text-slate-900">{item.name}</span>
                      <span className="text-[10px] text-blue-600 block font-mono">SKU: {item.sku}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Ordered: {item.orderedQty}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block">Received Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={item.receivedQty}
                        onChange={(e) => handleItemQtyChange(idx, 'receivedQty', e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-rose-500 block">Damaged Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={item.damagedQty}
                        onChange={(e) => handleItemQtyChange(idx, 'damagedQty', e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded p-1.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-emerald-600 block font-semibold">Accepted Qty</label>
                      <input
                        type="number"
                        readOnly
                        value={item.acceptedQty}
                        className="w-full text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded p-1.5"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Inspection Remarks & Discrepancy Notes
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Packaging intact, heat certificates checked, 0 rejection"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </form>
      </Modal>

      {/* --- VIEW GRN DETAILS MODAL --- */}
      {activeGRN && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Goods Receipt Note: ${activeGRN.grnNumber}`}
          subtitle={`PO Reference: ${activeGRN.poNumber}`}
          maxWidth="max-w-2xl"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Supplier</span>
                <span className="font-semibold text-slate-900">{activeGRN.supplierName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Received Date</span>
                <span className="font-semibold text-slate-900">{formatDate(activeGRN.receivedDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Receipt Status</span>
                <Badge status={activeGRN.receiptStatus} />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Challan Number</span>
                <span className="font-mono font-bold text-slate-900">{activeGRN.challanNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Vehicle Number</span>
                <span className="font-mono text-slate-900">{activeGRN.vehicleNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Inspector</span>
                <span className="font-semibold text-slate-900">{activeGRN.inspectedBy}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Items Inspection Ledger
              </span>
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Ordered</th>
                    <th className="p-2.5 text-center">Received</th>
                    <th className="p-2.5 text-center">Damaged</th>
                    <th className="p-2.5 text-center text-emerald-700">Accepted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {activeGRN.itemsReceived?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-slate-900">
                        {it.name}
                        {it.sku && <span className="block text-[10px] text-blue-600 font-mono">SKU: {it.sku}</span>}
                      </td>
                      <td className="p-2.5 text-center text-slate-500">{it.orderedQty}</td>
                      <td className="p-2.5 text-center font-semibold text-slate-900">{it.receivedQty}</td>
                      <td className="p-2.5 text-center font-bold text-rose-600">{it.damagedQty || 0}</td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">{it.acceptedQty || it.receivedQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 italic">
              <strong>Inspector Remarks:</strong> "{activeGRN.remarks || 'No remarks recorded.'}"
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
