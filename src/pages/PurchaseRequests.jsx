import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit,
  ArrowRight,
  Calendar,
  Building,
  User,
  Package,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';

export const PurchaseRequests = () => {
  const {
    purchaseRequests,
    departments,
    inventory,
    addPurchaseRequest,
    updatePurchaseRequest,
    approvePurchaseRequest,
    rejectPurchaseRequest,
    deletePurchaseRequest,
    createPOFromRequest,
    promptConfirm,
    settings,
  } = useStore();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  // New Request Form State
  const defaultForm = {
    department: 'Operations & Production',
    requestedBy: '',
    itemName: '',
    sku: '',
    quantity: 1,
    unit: 'Pcs',
    estimatedPrice: 0,
    priority: 'Medium',
    requiredDeliveryDate: '',
    justification: '',
  };
  const [formData, setFormData] = useState(defaultForm);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return purchaseRequests.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchDept = departmentFilter === 'ALL' || item.department === departmentFilter;
      const matchPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;

      return matchSearch && matchStatus && matchDept && matchPriority;
    });
  }, [purchaseRequests, searchTerm, statusFilter, departmentFilter, priorityFilter]);

  // Paginated dataset
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Handlers for Add Form
  const handleItemSelect = (e) => {
    const selectedSku = e.target.value;
    if (!selectedSku) {
      setFormData((prev) => ({ ...prev, sku: '', itemName: '' }));
      return;
    }
    const invItem = inventory.find((i) => i.sku === selectedSku);
    if (invItem) {
      setFormData((prev) => ({
        ...prev,
        sku: invItem.sku,
        itemName: invItem.name,
        unit: invItem.unit,
        estimatedPrice: invItem.unitPrice,
      }));
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemName || !formData.requestedBy) {
      alert('Please fill in required fields (Item Name and Requester)');
      return;
    }

    addPurchaseRequest(formData);
    setIsAddModalOpen(false);
    setFormData(defaultForm);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!activeRequest) return;
    updatePurchaseRequest(activeRequest.id, activeRequest);
    setIsEditModalOpen(false);
  };

  // Actions with Confirmation
  const handleApprove = (req) => {
    promptConfirm({
      title: `Approve Purchase Request ${req.id}?`,
      message: `You are approving the procurement of ${req.quantity} ${req.unit} of "${req.itemName}" costing ${formatCurrency(
        req.totalEstimatedCost,
        settings.currency
      )}.`,
      confirmText: 'Approve Request',
      variant: 'primary',
      onConfirm: () => approvePurchaseRequest(req.id),
    });
  };

  const handleReject = (req) => {
    promptConfirm({
      title: `Reject Purchase Request ${req.id}?`,
      message: `Are you sure you want to decline this requisition? Please confirm.`,
      confirmText: 'Reject Request',
      variant: 'danger',
      onConfirm: () => rejectPurchaseRequest(req.id, 'Declined by Procurement Review Board'),
    });
  };

  const handleDelete = (req) => {
    promptConfirm({
      title: `Delete Requisition ${req.id}?`,
      message: `This action will remove request record ${req.id} permanently from the system.`,
      confirmText: 'Delete Requisition',
      variant: 'danger',
      onConfirm: () => deletePurchaseRequest(req.id),
    });
  };

  const handleConvertToPO = (req) => {
    promptConfirm({
      title: `Generate PO from Request ${req.id}?`,
      message: `This will automatically generate an official Purchase Order and link it to this requisition.`,
      confirmText: 'Generate Purchase Order',
      variant: 'primary',
      onConfirm: () => createPOFromRequest(req.id),
    });
  };

  const handleExportCSV = () => {
    exportToCSV('purchase_requests', filteredData, {
      id: 'Request ID',
      requestDate: 'Request Date',
      department: 'Department',
      requestedBy: 'Requested By',
      itemName: 'Item Name',
      sku: 'SKU',
      quantity: 'Quantity',
      unit: 'Unit',
      estimatedPrice: 'Unit Price',
      totalEstimatedCost: 'Total Cost',
      priority: 'Priority',
      status: 'Status',
      requiredDeliveryDate: 'Required By',
      justification: 'Justification',
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Purchase Requests & Indents
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Submit, inspect, verify, and approve internal departmental requisitions before raising POs.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setFormData(defaultForm);
              setIsAddModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Request</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Request ID, Item description, or Requester..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="PO Created">PO Created</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Department filter */}
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Main Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Request ID</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Department & Requester</th>
                <th className="px-4 py-3.5">Item Description</th>
                <th className="px-3 py-3.5 text-center">Qty</th>
                <th className="px-4 py-3.5 text-right">Est. Cost</th>
                <th className="px-3 py-3.5 text-center">Priority</th>
                <th className="px-3 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedData.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold font-mono text-slate-900">{req.id}</td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{formatDate(req.requestDate)}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{req.department}</div>
                    <div className="text-slate-400 text-xs flex items-center mt-0.5">
                      <User className="w-3 h-3 mr-1 inline" />
                      {req.requestedBy}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-900 max-w-xs truncate">{req.itemName}</div>
                    {req.sku && <div className="text-[11px] text-blue-600 font-mono mt-0.5">{req.sku}</div>}
                  </td>
                  <td className="px-3 py-3.5 text-center font-medium">
                    {req.quantity} <span className="text-slate-400 text-xs">{req.unit}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                    {formatCurrency(req.totalEstimatedCost, settings.currency)}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <Badge status={req.priority} />
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <Badge status={req.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center space-x-1">
                      {/* View Details */}
                      <button
                        onClick={() => {
                          setActiveRequest(req);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Requisition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit (if pending) */}
                      {req.status === 'Pending Approval' && (
                        <button
                          onClick={() => {
                            setActiveRequest(req);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Requisition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {/* Approve / Reject buttons */}
                      {req.status === 'Pending Approval' && (
                        <>
                          <button
                            onClick={() => handleApprove(req)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve Requisition"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(req)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Reject Requisition"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Convert to PO button */}
                      {req.status === 'Approved' && (
                        <button
                          onClick={() => handleConvertToPO(req)}
                          className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors ml-1"
                          title="Generate Purchase Order"
                        >
                          Raise PO <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(req)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Requisition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <EmptyState
              title="No purchase requests found"
              description="No requisitions match your current filter criteria. Try clearing search or filters."
              actionLabel="Create Purchase Request"
              onAction={() => setIsAddModalOpen(true)}
            />
          )}
        </div>

        {/* Working Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* --- ADD PURCHASE REQUEST MODAL --- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Purchase Requisition (PR)"
        subtitle="Department indent requisition with automatic cost estimate computation"
        maxWidth="max-w-3xl"
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
              form="add-pr-form"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all"
            >
              Submit for Approval
            </button>
          </>
        }
      >
        <form id="add-pr-form" onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requesting Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requested By (Name & Designation) *
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Pawar (Sr. Tech)"
                value={formData.requestedBy}
                onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick Select from existing Store SKU */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Existing Catalog Item (Optional autofill)
            </label>
            <select
              value={formData.sku}
              onChange={handleItemSelect}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Or enter custom item details below --</option>
              {inventory.map((item) => (
                <option key={item.id} value={item.sku}>
                  [{item.sku}] {item.name} ({item.unit}) - Standard: {formatCurrency(item.unitPrice, settings.currency)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Item Name & Technical Specifications *
            </label>
            <input
              type="text"
              placeholder="e.g. Industrial Deep Groove Ball Bearing 6205-2RS"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity Required *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit of Measure
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pcs">Pcs (Pieces)</option>
                <option value="Units">Units</option>
                <option value="Barrels">Barrels</option>
                <option value="Boxes (100)">Boxes (100)</option>
                <option value="Pairs">Pairs</option>
                <option value="Packets (5kg)">Packets (5kg)</option>
                <option value="Cans">Cans</option>
                <option value="Reams">Reams</option>
                <option value="Bars">Bars</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Unit Price ({settings.currency}) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.estimatedPrice}
                onChange={(e) => setFormData({ ...formData, estimatedPrice: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Automatic Total Cost Display Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <span className="text-xs font-medium text-blue-800">
              Computed Total Estimated Requisition Amount:
            </span>
            <span className="text-base font-extrabold text-blue-900">
              {formatCurrency((formData.quantity || 0) * (formData.estimatedPrice || 0), settings.currency)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low - Routine Stock</option>
                <option value="Medium">Medium - Regular Production</option>
                <option value="High">High - Impending Critical Need</option>
                <option value="Urgent">Urgent - Machine Breakdown / Line Stoppage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Delivery By Date
              </label>
              <input
                type="date"
                value={formData.requiredDeliveryDate}
                onChange={(e) => setFormData({ ...formData, requiredDeliveryDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Justification & Business Need
            </label>
            <textarea
              rows="3"
              placeholder="Explain the necessity, machine application, breakdown code, or customer project requirement..."
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Modal>

      {/* --- VIEW PURCHASE REQUEST MODAL --- */}
      {activeRequest && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Purchase Requisition ${activeRequest.id}`}
          subtitle={`Department: ${activeRequest.department}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400">Status: {activeRequest.status}</span>
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
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Request Date</span>
                <span className="font-semibold text-slate-900">{formatDate(activeRequest.requestDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Requested By</span>
                <span className="font-semibold text-slate-900">{activeRequest.requestedBy}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Priority</span>
                <Badge status={activeRequest.priority} />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Delivery Deadline</span>
                <span className="font-semibold text-slate-900">{formatDate(activeRequest.requiredDeliveryDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Estimated Total</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(activeRequest.totalEstimatedCost, settings.currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Approval Status</span>
                <Badge status={activeRequest.status} />
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Item Details
              </span>
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <div className="font-semibold text-slate-900">{activeRequest.itemName}</div>
                {activeRequest.sku && (
                  <div className="text-xs font-mono text-blue-600">SKU: {activeRequest.sku}</div>
                )}
                <div className="text-xs text-slate-600">
                  Quantity: {activeRequest.quantity} {activeRequest.unit} @ {formatCurrency(activeRequest.estimatedPrice, settings.currency)} per unit
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Operational Justification
              </span>
              <p className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 leading-relaxed italic">
                "{activeRequest.justification || 'No specific justification notes entered.'}"
              </p>
            </div>

            {activeRequest.approvedBy && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                <strong>Approved by:</strong> {activeRequest.approvedBy} on {formatDate(activeRequest.approvalDate)}
              </div>
            )}

            {activeRequest.rejectionReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                <strong>Rejection Reason:</strong> {activeRequest.rejectionReason}
              </div>
            )}

            {activeRequest.poNumber && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs">
                <strong>Linked PO Number:</strong> {activeRequest.poNumber}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* --- EDIT PURCHASE REQUEST MODAL --- */}
      {activeRequest && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Requisition ${activeRequest.id}`}
          subtitle="Modify item quantities and details before managerial signoff"
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
                form="edit-pr-form"
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
              >
                Save Changes
              </button>
            </>
          }
        >
          <form id="edit-pr-form" onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Item Description</label>
              <input
                type="text"
                value={activeRequest.itemName}
                onChange={(e) => setActiveRequest({ ...activeRequest, itemName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={activeRequest.quantity}
                  onChange={(e) => setActiveRequest({ ...activeRequest, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price ({settings.currency})</label>
                <input
                  type="number"
                  min="0"
                  value={activeRequest.estimatedPrice}
                  onChange={(e) => setActiveRequest({ ...activeRequest, estimatedPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Justification</label>
              <textarea
                rows="3"
                value={activeRequest.justification}
                onChange={(e) => setActiveRequest({ ...activeRequest, justification: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
