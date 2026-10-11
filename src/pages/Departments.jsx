import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Users,
  IndianRupee,
  Mail,
  Edit,
  Trash2,
  Eye,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { formatCurrency } from '../utils/formatters';

export const Departments = () => {
  const {
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    promptConfirm,
    settings,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeDept, setActiveDept] = useState(null);

  // Form State
  const defaultDeptForm = {
    name: '',
    code: '',
    head: '',
    employeeCount: 20,
    assignedInventoryValue: 500000,
    budget: 2000000,
    spentThisQuarter: 400000,
    contactEmail: '',
    location: '',
  };
  const [formData, setFormData] = useState(defaultDeptForm);

  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      return (
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [departments, searchTerm]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.head) {
      alert('Department Name and Department Head are required');
      return;
    }
    addDepartment(formData);
    setIsAddModalOpen(false);
    setFormData(defaultDeptForm);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!activeDept) return;
    updateDepartment(activeDept.id, activeDept);
    setIsEditModalOpen(false);
  };

  const handleDelete = (dept) => {
    promptConfirm({
      title: `Delete Department ${dept.name}?`,
      message: `Are you sure you want to remove ${dept.name}? Active inventory or requisitions may be linked to this department.`,
      confirmText: 'Delete Department',
      variant: 'danger',
      onConfirm: () => deleteDepartment(dept.id),
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
            Departments & Cost Centers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Internal operational units, requisition authorities, procurement budget allotments, and asset values.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setFormData(defaultDeptForm);
              setIsAddModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Department Name, Head, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-1.5 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              viewMode === 'cards'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Grid Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              viewMode === 'table'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Grid Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepartments.map((dept) => {
            const budgetPct = Math.min(
              Math.round(((dept.spentThisQuarter || 0) / (dept.budget || 1)) * 100),
              100
            );

            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {dept.code}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">{dept.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {dept.location || 'Central Facility'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setActiveDept(dept);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Department Head:</span>
                      <span className="font-semibold text-slate-800">{dept.head}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Headcount / Staff:</span>
                      <span className="font-semibold text-slate-800">{dept.employeeCount} Members</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Assigned Inventory Value:</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(dept.assignedInventoryValue, settings.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="flex items-center">
                        <Mail className="w-3 h-3 mr-1 text-slate-400" /> {dept.contactEmail}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Budget Utilization Bar */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 font-medium">Quarterly Budget Utilization:</span>
                    <span className="font-bold text-slate-700">{budgetPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        budgetPct > 85 ? 'bg-rose-500' : budgetPct > 60 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${budgetPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>Spent: {formatCurrency(dept.spentThisQuarter, settings.currency)}</span>
                    <span>Allotted: {formatCurrency(dept.budget, settings.currency)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Code</th>
                  <th className="px-4 py-3.5">Department Name</th>
                  <th className="px-4 py-3.5">Head of Department</th>
                  <th className="px-3 py-3.5 text-center">Employees</th>
                  <th className="px-4 py-3.5 text-right">Assigned Inventory</th>
                  <th className="px-4 py-3.5 text-right">Quarterly Budget</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold font-mono text-blue-600">{dept.code}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{dept.name}</td>
                    <td className="px-4 py-3.5 text-slate-800">{dept.head}</td>
                    <td className="px-3 py-3.5 text-center font-medium">{dept.employeeCount}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(dept.assignedInventoryValue, settings.currency)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-600">
                      {formatCurrency(dept.budget, settings.currency)}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => {
                          setActiveDept(dept);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredDepartments.length === 0 && (
        <EmptyState
          title="No departments found"
          description="No organizational cost centers matched your search query."
          actionLabel="Create Department"
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      {/* --- ADD DEPARTMENT MODAL --- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Organizational Department"
        subtitle="Configure new requisition unit and budgetary allocations"
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
              form="add-dept-form"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
            >
              Create Department
            </button>
          </>
        }
      >
        <form id="add-dept-form" onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
              <input
                type="text"
                placeholder="e.g. Quality Assurance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Code *</label>
              <input
                type="text"
                placeholder="e.g. QAC"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Head *</label>
              <input
                type="text"
                placeholder="e.g. Divya Nambiar"
                value={formData.head}
                onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                placeholder="dept@bharatprecision.in"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Headcount</label>
              <input
                type="number"
                min="1"
                value={formData.employeeCount}
                onChange={(e) => setFormData({ ...formData, employeeCount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quarterly Budget ({settings.currency})
              </label>
              <input
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Stock ({settings.currency})
              </label>
              <input
                type="number"
                min="0"
                value={formData.assignedInventoryValue}
                onChange={(e) => setFormData({ ...formData, assignedInventoryValue: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location Coordinates</label>
            <input
              type="text"
              placeholder="e.g. Standard Metrology Lab Bldg B"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </form>
      </Modal>

      {/* --- EDIT DEPARTMENT MODAL --- */}
      {activeDept && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit ${activeDept.name}`}
          subtitle="Modify budget allotments and leadership contacts"
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
                form="edit-dept-form"
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
              >
                Save Changes
              </button>
            </>
          }
        >
          <form id="edit-dept-form" onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Head</label>
              <input
                type="text"
                value={activeDept.head}
                onChange={(e) => setActiveDept({ ...activeDept, head: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quarterly Budget ({settings.currency})</label>
                <input
                  type="number"
                  value={activeDept.budget}
                  onChange={(e) => setActiveDept({ ...activeDept, budget: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Quarter Spent</label>
                <input
                  type="number"
                  value={activeDept.spentThisQuarter}
                  onChange={(e) => setActiveDept({ ...activeDept, spentThisQuarter: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
