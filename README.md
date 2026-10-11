# NexStore ERP — Purchase Department & Store Inventory Management System

A complete, modern, professional, enterprise-grade **Purchase Department & Store Inventory Management System — Frontend Only Prototype**.

Built entirely for in-browser demonstration with reactive mock state, persistent `localStorage` synchronization, dynamic KPI metrics, and realistic Indian corporate procurement data.

---

## 🌟 Key Highlights

- **Pure Frontend Architecture**: Runs 100% in the browser. Zero backend, database, API, or authentication server required.
- **Enterprise Design**: Clean white and light-grey background (`slate-50`), deep navy sidebar (`slate-900`) with subtle blue accents, professional typography (Inter), rounded corners, soft shadows, and responsive layouts.
- **Persistent LocalStorage State**: All actions (creating PRs, issuing POs, recording Stock IN/OUT, receiving GRNs, adding inventory, editing suppliers) persist across page switches and browser refreshes.
- **Factory Reset Support**: Quick "Reset Demo" button in the navigation bar to instantly restore the initial demonstration dataset at any time.
- **Real-Time Inventory Validation**: Immediate stock level updates upon transactions. Prevents Stock OUT beyond available on-hand balance; never permits negative stock.
- **Client-Side CSV Exports**: Export filtered datasets directly to CSV from Purchase Requests, Purchase Orders, Store Inventory, Suppliers, Goods Receipts, and Analytics Reports.

---

## 🛠️ Technology Stack

- **React 19** with **Vite**
- **Tailwind CSS** (v3)
- **Lucide React** (icons)
- **Recharts** (interactive spending & distribution charts)
- **React Context & Hooks** (`StoreContext.jsx`)
- **Browser LocalStorage API**

---

## 🧭 Application Modules (10 Interactive Pages)

1. **Dashboard**
   - 6 KPI Cards: Total Inventory Items, Physical Stock Value (₹), Low Stock Alerts, Pending Purchase Requisitions, Active Vendor Purchase Orders, and Pending GRN Inspection Docks.
   - Monthly Purchase Expenditure bar chart (actual spend vs. budget).
   - Commodity inventory value breakdown pie chart.
   - Quick one-click approval/rejection triggers for pending requisitions.
   - Low-stock watchlist and recent stock transaction feed.

2. **Purchase Requests (PR)**
   - Search by ID, item name, or requester; filter by status, priority, and department.
   - **New Purchase Request Modal**: department, requester, item description, quantity, unit price, delivery deadline, and operational justification.
   - Automatic calculation of estimated total cost.
   - Approval and rejection flows with custom confirmation modals.
   - **One-click "Raise PO" action** to automatically convert approved requests into official purchase orders.
   - Pagination and CSV export.

3. **Purchase Orders (PO)**
   - Official commercial vendor contracts with PO numbering (`PO-2026-001`, etc.).
   - Multi-item order creation with dynamic line item addition, price calculation, and delivery date.
   - Printable Purchase Order view modal with legal company information, vendor details, and commercial terms.
   - Inline status updates (Issued, Partially Received, Completed, Draft, Cancelled) and payment status (Pending, Partial, Paid).

4. **Approved Suppliers Directory**
   - Directory of sample Indian vendors (Tata Steel, SKF, L&T, Bharat Petroleum, Festo, Karam Safety, Wipro, etc.).
   - GSTIN compliance verification, contact persons, phone numbers, and payment terms (Net 30, Net 45, Immediate, Advance 50%).
   - Register, edit, activate/deactivate, and delete supplier interactions.

5. **Central Store Inventory Ledger**
   - SKU, Item Name, Commodity Category, Storage Bin Location, Quantity, Safety Stock Buffer, Unit Price, and Valuation.
   - Visual stock level progress bars with color-coded safety warnings.
   - **Quick Stock Issue / Inward modal** directly accessible from any inventory row.
   - Add new SKU modal and edit storage coordinates.

6. **Stock Movement & Transaction Ledger**
   - Audit trail for **Stock IN**, **Stock OUT**, and **Adjustment**.
   - Immediate inventory balance updates upon submission.
   - Automatic deduction validation preventing issues beyond available stock.
   - Floating toast notification alerts upon posting.

7. **Goods Receipt Note (GRN)**
   - Dock inward receiving and physical quality inspection against PO references.
   - Auto-fills supplier and line items upon selecting an active Purchase Order.
   - Supports recording damaged vs. accepted quantities.
   - Automatically credits accepted items to store inventory and logs a Stock IN transaction.

8. **Departments & Cost Centers**
   - Management for Operations & Production, Plant Maintenance, R&D, Quality Assurance, IT, Administration, Finance, and HR.
   - Toggle between **Card Grid View** and **Table View**.
   - Quarterly budget allocation tracking with progress bars showing expenditure percentage.
   - Add and edit department dialogs.

9. **Reports & Analytics**
   - Multi-tab report hub:
     * Expenditure Run-Rate area chart & department cost center spending.
     * Low-Stock Risk & Replenishment Deficit audit report.
     * Vendor Volume & Procurement Expenditure analysis.
     * Department budget variance ledger.
   - Working browser CSV downloads for each report tab.

10. **System Configuration & Settings**
    - Corporate entity profile (Company legal name, trade name, GSTIN, CIN, factory address, contact email).
    - Currency selection (₹ INR, $ USD, € EUR, £ GBP).
    - Tiered managerial auto-approval threshold configuration.
    - Low-stock notification limits and display preferences.

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser at the local URL displayed (typically `http://localhost:5173`).

### 3. Build for Production
```bash
npm run build
```

---

## 🏢 Demonstration Data
All seeded records use realistic Indian enterprise details:
- **Company**: *Bharat Heavy Precision Engineering Ltd.* (MIDC Industrial Area, Mumbai)
- **GSTIN**: `27AABCB2345M1Z4`
- **Currency**: `₹` (Indian Rupee with standard lakh/crore comma conventions)
