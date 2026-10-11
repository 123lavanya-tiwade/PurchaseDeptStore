import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building,
  CreditCard,
  Star,
  MapPin,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { exportToCSV } from '../utils/formatters';

export const Suppliers = () => {
  const {
    suppliers,
    addSupplier,
    updateSupplier,
    toggleSupplierStatus,
    deleteSupplier,
    promptConfirm,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [termsFilter, setTermsFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeSupplier, setActiveSupplier] = useState(null);

  // Add Form State
  const defaultSupplierForm = {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    paymentTerms: 'Net 30',
    category: 'Mechanical & Spares',
    address: '',
    city: 'Mumbai',
    rating: 4.5,
    status: 'Active',
  };
  const [formData, setFormData] = useState(defaultSupplierForm);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      const matchTerms = termsFilter === 'ALL' || s.paymentTerms === termsFilter;

      return matchSearch && matchStatus && matchTerms;
    });
  }, [suppliers, searchTerm, statusFilter, termsFilter]);

  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSuppliers.slice(startIndex, startIndex + pageSize);
  }, [filteredSuppliers, currentPage, pageSize]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contactPerson || !formData.gstin) {
      alert('Please fill in required supplier fields (Company Name, Contact Person, GSTIN)');
      return;
    }
    addSupplier(formData);
    setIsAddModalOpen(false);
    setFormData(defaultSupplierForm);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!activeSupplier) return;
    updateSupplier(activeSupplier.id, activeSupplier);
    setIsEditModalOpen(false);
  };

  const handleToggleStatus = (sup) => {
    promptConfirm({
      title: `${sup.status === 'Active' ? 'Deactivate' : 'Activate'} Supplier ${sup.name}?`,
      message: `Are you sure you want to change the status of ${sup.name} to ${
        sup.status === 'Active' ? 'Inactive' : 'Active'
      }?`,
      confirmText: sup.status === 'Active' ? 'Deactivate' : 'Activate',
      variant: sup.status === 'Active' ? 'warning' : 'primary',
      onConfirm: () => toggleSupplierStatus(sup.id),
    });
  };

  const handleDelete = (sup) => {
    promptConfirm({
      title: `Delete Supplier ${sup.name}?`,
      message: `This will remove vendor ${sup.name} (${sup.id}) from the active vendor registry.`,
      confirmText: 'Delete Supplier',
      variant: 'danger',
      onConfirm: () => deleteSupplier(sup.id),
    });
  };

  const handleExportCSV = () => {
    exportToCSV('suppliers_directory', filteredSuppliers, {
      id: 'Supplier ID',
      name: 'Company Name',
      contactPerson: 'Contact Person',
      email: 'Email',
      phone: 'Phone',
      gstin: 'GSTIN',
      paymentTerms: 'Payment Terms',
      category: 'Category',
      city: 'City / Region',
      status: 'Status',
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Approved Suppliers Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Registered corporate vendors, Indian GSTIN compliance records, contact points, and commercial payment terms.
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
              setFormData(defaultSupplierForm);
              setIsAddModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Company Name, GSTIN, Contact Person, or City..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={termsFilter}
            onChange={(e) => {
              setTermsFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Payment Terms</option>
            <option value="Net 30">Net 30 Days</option>
            <option value="Net 45">Net 45 Days</option>
            <option value="Net 15">Net 15 Days</option>
            <option value="Immediate">Immediate / COD</option>
            <option value="Advance 50%">Advance 50%</option>
          </select>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Supplier ID</th>
                <th className="px-4 py-3.5">Company Name & Category</th>
                <th className="px-4 py-3.5">Contact Person</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">GSTIN</th>
                <th className="px-3 py-3.5 text-center">Terms</th>
                <th className="px-3 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedSuppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-bold font-mono text-slate-900">{sup.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{sup.name}</div>
                    <div className="text-[11px] text-blue-600 font-medium">{sup.category}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-900">{sup.contactPerson}</div>
                    <div className="text-slate-400 text-[11px] flex items-center">
                      <MapPin className="w-3 h-3 mr-1 inline" /> {sup.city}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">
                    <div className="flex items-center text-slate-800">
                      <Phone className="w-3 h-3 text-slate-400 mr-1.5" />
                      {sup.phone}
                    </div>
                    <div className="flex items-center text-slate-500 text-[11px] mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400 mr-1.5" />
                      {sup.email}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-800">
                    {sup.gstin}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {sup.paymentTerms}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <Badge status={sup.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setActiveSupplier(sup);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setActiveSupplier(sup);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Supplier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(sup)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          sup.status === 'Active'
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={sup.status === 'Active' ? 'Deactivate Supplier' : 'Activate Supplier'}
                      >
                        {sup.status === 'Active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(sup)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Supplier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSuppliers.length === 0 && (
            <EmptyState
              title="No suppliers match criteria"
              description="No vendors found for the specified search query or status filter."
              actionLabel="Add New Supplier"
              onAction={() => setIsAddModalOpen(true)}
            />
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredSuppliers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* --- ADD SUPPLIER MODAL --- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Supplier"
        subtitle="Add approved corporate vendor to vendor master registry"
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
              form="add-sup-form"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
            >
              Register Supplier
            </button>
          </>
        }
      >
        <form id="add-sup-form" onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Legal Name *</label>
              <input
                type="text"
                placeholder="e.g. SKF India Precision Bearings Ltd."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Commodity / Category</label>
              <input
                type="text"
                placeholder="e.g. Mechanical & Bearings"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
              <input
                type="text"
                placeholder="e.g. Ananya Deshmukh"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email *</label>
              <input
                type="email"
                placeholder="orders@vendor.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                placeholder="+91 98201 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number (15 chars) *</label>
              <input
                type="text"
                placeholder="27AAACS1845G1ZP"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              >
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 45">Net 45 Days</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Immediate">Immediate / COD</option>
                <option value="Advance 50%">Advance 50%</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
              <input
                type="text"
                placeholder="e.g. Pune / Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Office / Works Address</label>
            <input
              type="text"
              placeholder="e.g. Chinchwad Industrial Complex, Pimpri, Pune"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </form>
      </Modal>

      {/* --- EDIT SUPPLIER MODAL --- */}
      {activeSupplier && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Supplier: ${activeSupplier.name}`}
          subtitle={`Supplier ID: ${activeSupplier.id}`}
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
                form="edit-sup-form"
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
              >
                Save Supplier
              </button>
            </>
          }
        >
          <form id="edit-sup-form" onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={activeSupplier.name}
                onChange={(e) => setActiveSupplier({ ...activeSupplier, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={activeSupplier.contactPerson}
                  onChange={(e) => setActiveSupplier({ ...activeSupplier, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={activeSupplier.phone}
                  onChange={(e) => setActiveSupplier({ ...activeSupplier, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={activeSupplier.email}
                  onChange={(e) => setActiveSupplier({ ...activeSupplier, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
                <select
                  value={activeSupplier.paymentTerms}
                  onChange={(e) => setActiveSupplier({ ...activeSupplier, paymentTerms: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 45">Net 45 Days</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Immediate">Immediate / COD</option>
                  <option value="Advance 50%">Advance 50%</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* --- VIEW SUPPLIER MODAL --- */}
      {activeSupplier && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={activeSupplier.name}
          subtitle={`Supplier Code: ${activeSupplier.id}`}
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
                <span className="text-slate-400 block text-[11px]">Commodity Focus</span>
                <span className="font-bold text-slate-900">{activeSupplier.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Vendor Status</span>
                <Badge status={activeSupplier.status} />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">GSTIN Compliance</span>
                <span className="font-mono font-bold text-slate-900">{activeSupplier.gstin}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Payment Terms</span>
                <span className="font-semibold text-slate-900">{activeSupplier.paymentTerms}</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact & Address</div>
              <div className="text-slate-800">
                <strong>Contact Person:</strong> {activeSupplier.contactPerson}
              </div>
              <div className="text-slate-800">
                <strong>Phone:</strong> {activeSupplier.phone}
              </div>
              <div className="text-slate-800">
                <strong>Email:</strong> {activeSupplier.email}
              </div>
              <div className="text-slate-800">
                <strong>Address:</strong> {activeSupplier.address || 'MIDC Industrial Depot'}, {activeSupplier.city}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
