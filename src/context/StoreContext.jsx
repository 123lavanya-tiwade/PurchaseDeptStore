import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialCompanySettings,
  initialInventoryItems,
  initialSuppliers,
  initialPurchaseRequests,
  initialPurchaseOrders,
  initialGoodsReceiptNotes,
  initialStockTransactions,
  initialDepartments,
  monthlySpendData,
} from '../data/initialData';
import { getStockStatus } from '../utils/formatters';

const LOCAL_STORAGE_KEY = 'nexstore_inventory_erp_v1';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  // Try loading from localStorage or use initial seed data
  const loadInitial = (key, fallback) => {
    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${key}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn(`Failed reading ${key} from localStorage:`, e);
    }
    return fallback;
  };

  // Current active page state
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core entities
  const [settings, setSettings] = useState(() => loadInitial('settings', initialCompanySettings));
  const [inventory, setInventory] = useState(() => loadInitial('inventory', initialInventoryItems));
  const [suppliers, setSuppliers] = useState(() => loadInitial('suppliers', initialSuppliers));
  const [purchaseRequests, setPurchaseRequests] = useState(() => loadInitial('purchaseRequests', initialPurchaseRequests));
  const [purchaseOrders, setPurchaseOrders] = useState(() => loadInitial('purchaseOrders', initialPurchaseOrders));
  const [goodsReceipts, setGoodsReceipts] = useState(() => loadInitial('goodsReceipts', initialGoodsReceiptNotes));
  const [stockTransactions, setStockTransactions] = useState(() => loadInitial('stockTransactions', initialStockTransactions));
  const [departments, setDepartments] = useState(() => loadInitial('departments', initialDepartments));

  // Global Toast Notifications Stack
  const [toasts, setToasts] = useState([]);

  // Global Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger', // danger, warning, primary
    onConfirm: () => {},
  });

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_inventory`, JSON.stringify(inventory));
    } catch (e) {}
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
    } catch (e) {}
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_purchaseRequests`, JSON.stringify(purchaseRequests));
    } catch (e) {}
  }, [purchaseRequests]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_purchaseOrders`, JSON.stringify(purchaseOrders));
    } catch (e) {}
  }, [purchaseOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_goodsReceipts`, JSON.stringify(goodsReceipts));
    } catch (e) {}
  }, [goodsReceipts]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_stockTransactions`, JSON.stringify(stockTransactions));
    } catch (e) {}
  }, [stockTransactions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_departments`, JSON.stringify(departments));
    } catch (e) {}
  }, [departments]);

  // Toast Helpers
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Confirmation Modal Trigger
  const promptConfirm = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', onConfirm }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      variant,
      onConfirm: () => {
        onConfirm();
        closeConfirm();
      },
    });
  };

  const closeConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // Reset to factory mock data
  const resetAllData = () => {
    setSettings(initialCompanySettings);
    setInventory(initialInventoryItems);
    setSuppliers(initialSuppliers);
    setPurchaseRequests(initialPurchaseRequests);
    setPurchaseOrders(initialPurchaseOrders);
    setGoodsReceipts(initialGoodsReceiptNotes);
    setStockTransactions(initialStockTransactions);
    setDepartments(initialDepartments);
    showToast('Demo data reset back to initial factory state successfully', 'info');
  };

  // --- Inventory Management Actions ---
  const addInventoryItem = (item) => {
    const newItem = {
      ...item,
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      quantity: Number(item.quantity) || 0,
      minStock: Number(item.minStock) || 0,
      unitPrice: Number(item.unitPrice) || 0,
    };
    setInventory((prev) => [newItem, ...prev]);
    showToast(`Inventory item "${newItem.name}" added successfully`);
    return newItem;
  };

  const updateInventoryItem = (id, updatedFields) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updatedFields,
              quantity: Number(updatedFields.quantity !== undefined ? updatedFields.quantity : item.quantity),
              minStock: Number(updatedFields.minStock !== undefined ? updatedFields.minStock : item.minStock),
              unitPrice: Number(updatedFields.unitPrice !== undefined ? updatedFields.unitPrice : item.unitPrice),
            }
          : item
      )
    );
    showToast('Inventory item updated successfully');
  };

  const deleteInventoryItem = (id) => {
    const target = inventory.find((i) => i.id === id);
    setInventory((prev) => prev.filter((i) => i.id !== id));
    showToast(`Deleted item "${target?.name || id}"`, 'warning');
  };

  // --- Purchase Request Actions ---
  const addPurchaseRequest = (requestData) => {
    const year = new Date().getFullYear();
    const count = purchaseRequests.length + 1;
    const reqId = `PR-${year}-${String(count).padStart(3, '0')}`;
    const qty = Number(requestData.quantity) || 1;
    const price = Number(requestData.estimatedPrice) || 0;
    const newReq = {
      ...requestData,
      id: reqId,
      quantity: qty,
      estimatedPrice: price,
      totalEstimatedCost: qty * price,
      status: 'Pending Approval',
      requestDate: new Date().toISOString().slice(0, 10),
    };
    setPurchaseRequests((prev) => [newReq, ...prev]);
    showToast(`Purchase Request ${reqId} created successfully`);
    return newReq;
  };

  const updatePurchaseRequest = (id, updatedFields) => {
    setPurchaseRequests((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;
        const qty = Number(updatedFields.quantity !== undefined ? updatedFields.quantity : req.quantity);
        const price = Number(updatedFields.estimatedPrice !== undefined ? updatedFields.estimatedPrice : req.estimatedPrice);
        return {
          ...req,
          ...updatedFields,
          quantity: qty,
          estimatedPrice: price,
          totalEstimatedCost: qty * price,
        };
      })
    );
    showToast(`Purchase Request ${id} updated`);
  };

  const approvePurchaseRequest = (id, approverName = 'Store Procurement Manager') => {
    setPurchaseRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'Approved',
              approvedBy: approverName,
              approvalDate: new Date().toISOString().slice(0, 10),
            }
          : req
      )
    );
    showToast(`Purchase Request ${id} approved! You can now create a PO.`, 'success');
  };

  const rejectPurchaseRequest = (id, reason = 'Budget allocation limits exceeded') => {
    setPurchaseRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'Rejected',
              rejectionReason: reason,
              rejectedDate: new Date().toISOString().slice(0, 10),
            }
          : req
      )
    );
    showToast(`Purchase Request ${id} rejected`, 'warning');
  };

  const deletePurchaseRequest = (id) => {
    setPurchaseRequests((prev) => prev.filter((r) => r.id !== id));
    showToast(`Purchase Request ${id} deleted`, 'info');
  };

  // Convert Approved PR to Purchase Order
  const createPOFromRequest = (reqId) => {
    const req = purchaseRequests.find((r) => r.id === reqId);
    if (!req) return;
    const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
    const supplier = suppliers[0]; // fallback default supplier

    const newPO = {
      id: poNumber,
      poNumber,
      supplierId: supplier ? supplier.id : 'SUP-001',
      supplierName: supplier ? supplier.name : 'Tata Steel Tubes & Structural Ltd.',
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDelivery: req.requiredDeliveryDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      totalAmount: req.totalEstimatedCost,
      paymentStatus: 'Pending',
      orderStatus: 'Issued',
      items: [
        {
          sku: req.sku || 'MEC-BRG-6205',
          name: req.itemName,
          qty: req.quantity,
          unitPrice: req.estimatedPrice,
          total: req.totalEstimatedCost,
        },
      ],
      terms: 'Net 30 days from delivery and inspection.',
      notes: `Generated directly from Purchase Request ${req.id} (${req.justification || ''})`,
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    // Update PR status to "PO Created"
    setPurchaseRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'PO Created', poNumber } : r))
    );
    showToast(`Purchase Order ${poNumber} generated successfully from ${reqId}`);
    return newPO;
  };

  // --- Purchase Order Actions ---
  const addPurchaseOrder = (orderData) => {
    const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
    const newPO = {
      ...orderData,
      id: poNumber,
      poNumber,
      orderDate: orderData.orderDate || new Date().toISOString().slice(0, 10),
      orderStatus: orderData.orderStatus || 'Issued',
      paymentStatus: orderData.paymentStatus || 'Pending',
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    showToast(`Purchase Order ${poNumber} created successfully`);
    return newPO;
  };

  const updatePurchaseOrderStatus = (id, newStatus) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === id ? { ...po, orderStatus: newStatus } : po))
    );
    showToast(`Order ${id} status updated to "${newStatus}"`);
  };

  const updatePurchaseOrderPaymentStatus = (id, newPaymentStatus) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === id ? { ...po, paymentStatus: newPaymentStatus } : po))
    );
    showToast(`Order ${id} payment marked as "${newPaymentStatus}"`);
  };

  // --- Supplier Actions ---
  const addSupplier = (supplierData) => {
    const id = `SUP-${String(suppliers.length + 1).padStart(3, '0')}`;
    const newSup = {
      ...supplierData,
      id,
      rating: supplierData.rating || 4.5,
      status: supplierData.status || 'Active',
    };
    setSuppliers((prev) => [newSup, ...prev]);
    showToast(`Supplier "${newSup.name}" added successfully`);
    return newSup;
  };

  const updateSupplier = (id, updatedFields) => {
    setSuppliers((prev) =>
      prev.map((sup) => (sup.id === id ? { ...sup, ...updatedFields } : sup))
    );
    showToast(`Supplier updated successfully`);
  };

  const toggleSupplierStatus = (id) => {
    setSuppliers((prev) =>
      prev.map((sup) => {
        if (sup.id === id) {
          const next = sup.status === 'Active' ? 'Inactive' : 'Active';
          showToast(`Supplier marked as ${next}`, 'info');
          return { ...sup, status: next };
        }
        return sup;
      })
    );
  };

  const deleteSupplier = (id) => {
    const sup = suppliers.find((s) => s.id === id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    showToast(`Supplier "${sup?.name || id}" removed`, 'warning');
  };

  // --- Stock Transactions & Inventory Update Engine ---
  // Mandatory: Updates inventory quantities immediately, never allows negative stock, prevents Stock OUT > available!
  const recordTransaction = ({
    sku,
    type, // 'Stock IN', 'Stock OUT', 'Adjustment'
    quantity,
    referenceNo = 'DIRECT-TXN',
    department = 'Store',
    performedBy = 'Store Manager',
    notes = '',
  }) => {
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      showToast('Quantity must be a positive number greater than zero', 'error');
      return { success: false, error: 'Invalid quantity' };
    }

    const item = inventory.find((i) => i.sku === sku);
    if (!item) {
      showToast(`SKU "${sku}" not found in inventory!`, 'error');
      return { success: false, error: 'Item not found' };
    }

    const prevQty = Number(item.quantity) || 0;
    let newQty = prevQty;

    if (type === 'Stock OUT') {
      if (qty > prevQty) {
        showToast(
          `Cannot dispatch ${qty} ${item.unit}. Available stock is only ${prevQty} ${item.unit}!`,
          'error'
        );
        return { success: false, error: 'Stock insufficient' };
      }
      newQty = prevQty - qty;
    } else if (type === 'Stock IN') {
      newQty = prevQty + qty;
    } else if (type === 'Adjustment') {
      // For adjustment, quantity can be replacement or delta
      newQty = qty; // direct adjustment to new verified count
    }

    // Safety guarantee: never negative
    if (newQty < 0) newQty = 0;

    // 1. Update Inventory State
    setInventory((prev) =>
      prev.map((i) => (i.sku === sku ? { ...i, quantity: newQty } : i))
    );

    // 2. Append Transaction to Ledger
    const now = new Date();
    const formattedDate = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const txnId = `TXN-${now.getFullYear()}-${String(stockTransactions.length + 1).padStart(3, '0')}`;

    const newTxn = {
      id: txnId,
      date: formattedDate,
      sku: item.sku,
      itemName: item.name,
      type,
      quantity: type === 'Adjustment' ? Math.abs(newQty - prevQty) : qty,
      previousStock: prevQty,
      newStock: newQty,
      referenceNo,
      department,
      performedBy,
      notes,
    };

    setStockTransactions((prev) => [newTxn, ...prev]);

    showToast(
      `Recorded ${type}: ${qty} ${item.unit} for ${item.name}. New Stock: ${newQty}`,
      'success'
    );
    return { success: true, transaction: newTxn, newStock: newQty };
  };

  // --- Goods Receipt (GRN) Management ---
  const recordGoodsReceipt = (grnData) => {
    const grnNumber = `GRN-${new Date().getFullYear()}-${String(goodsReceipts.length + 1).padStart(3, '0')}`;
    const newGRN = {
      ...grnData,
      id: grnNumber,
      grnNumber,
      receivedDate: grnData.receivedDate || new Date().toISOString().slice(0, 10),
      totalReceived: grnData.itemsReceived.reduce((acc, curr) => acc + (Number(curr.receivedQty) || 0), 0),
      totalDamaged: grnData.itemsReceived.reduce((acc, curr) => acc + (Number(curr.damagedQty) || 0), 0),
    };

    setGoodsReceipts((prev) => [newGRN, ...prev]);

    // Update inventory quantity and log Stock IN for each accepted item!
    grnData.itemsReceived.forEach((it) => {
      const accepted = Number(it.acceptedQty) || (Number(it.receivedQty) - Number(it.damagedQty || 0));
      if (accepted > 0 && it.sku) {
        // Record automatic Stock IN transaction
        recordTransaction({
          sku: it.sku,
          type: 'Stock IN',
          quantity: accepted,
          referenceNo: grnNumber,
          department: 'Central Store (Inward)',
          performedBy: grnData.inspectedBy || 'Goods Inward Inspector',
          notes: `GRN Receipt against PO ${grnData.poNumber}. Supplier: ${grnData.supplierName}`,
        });
      }
    });

    // Update corresponding PO status to "Partially Received" or "Completed"
    if (grnData.poNumber) {
      setPurchaseOrders((prev) =>
        prev.map((po) =>
          po.poNumber === grnData.poNumber
            ? { ...po, orderStatus: 'Partially Received' }
            : po
        )
      );
    }

    showToast(`Goods Receipt ${grnNumber} generated and stock updated!`, 'success');
    return newGRN;
  };

  // --- Department Actions ---
  const addDepartment = (deptData) => {
    const id = `DEP-${String(departments.length + 1).padStart(3, '0')}`;
    const newDept = {
      ...deptData,
      id,
      employeeCount: Number(deptData.employeeCount) || 1,
      assignedInventoryValue: Number(deptData.assignedInventoryValue) || 0,
      budget: Number(deptData.budget) || 1000000,
      spentThisQuarter: Number(deptData.spentThisQuarter) || 0,
    };
    setDepartments((prev) => [...prev, newDept]);
    showToast(`Department "${newDept.name}" added successfully`);
    return newDept;
  };

  const updateDepartment = (id, updatedFields) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updatedFields } : d))
    );
    showToast(`Department updated successfully`);
  };

  const deleteDepartment = (id) => {
    const d = departments.find((dep) => dep.id === id);
    setDepartments((prev) => prev.filter((dep) => dep.id !== id));
    showToast(`Department "${d?.name || id}" deleted`, 'warning');
  };

  // --- Calculated Dashboard KPIs ---
  const totalInventoryItems = inventory.length;
  const totalStockValue = inventory.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );
  const lowStockItems = inventory.filter((item) => {
    const status = getStockStatus(item.quantity, item.minStock);
    return status === 'Low Stock' || status === 'Out of Stock';
  });
  const lowStockCount = lowStockItems.length;
  const pendingPRCount = purchaseRequests.filter((pr) => pr.status === 'Pending Approval').length;
  const activePOCount = purchaseOrders.filter((po) => po.orderStatus === 'Issued' || po.orderStatus === 'Partially Received').length;
  const pendingGRNCount = goodsReceipts.filter((grn) => grn.receiptStatus === 'Under Inspection' || grn.receiptStatus === 'Partially Accepted').length;

  return (
    <StoreContext.Provider
      value={{
        activePage,
        setActivePage,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        settings,
        setSettings,
        resetAllData,
        // entities
        inventory,
        suppliers,
        purchaseRequests,
        purchaseOrders,
        goodsReceipts,
        stockTransactions,
        departments,
        monthlySpendData,
        // actions
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addPurchaseRequest,
        updatePurchaseRequest,
        approvePurchaseRequest,
        rejectPurchaseRequest,
        deletePurchaseRequest,
        createPOFromRequest,
        addPurchaseOrder,
        updatePurchaseOrderStatus,
        updatePurchaseOrderPaymentStatus,
        addSupplier,
        updateSupplier,
        toggleSupplierStatus,
        deleteSupplier,
        recordTransaction,
        recordGoodsReceipt,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        // feedback & dialogs
        toasts,
        showToast,
        removeToast,
        confirmDialog,
        promptConfirm,
        closeConfirm,
        // kpis
        totalInventoryItems,
        totalStockValue,
        lowStockItems,
        lowStockCount,
        pendingPRCount,
        activePOCount,
        pendingGRNCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
