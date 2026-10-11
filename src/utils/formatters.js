/**
 * Format number into Indian Currency (e.g. ₹12,45,800) or selected currency
 */
export const formatCurrency = (amount, currencySymbol = '₹') => {
  if (amount === undefined || amount === null || isNaN(amount)) return `${currencySymbol}0`;
  const num = Number(amount);
  
  if (currencySymbol === '₹') {
    // Indian numbering format (Lakhs, Crores)
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(num);
    return `₹${formatted}`;
  }

  return `${currencySymbol}${num.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
};

/**
 * Format standard ISO or date string to readable format (e.g. "12 Oct 2026")
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Format relative time or timestamp
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

/**
 * Export table data to CSV file using purely client-side JavaScript
 */
export const exportToCSV = (filename, data, headers) => {
  if (!data || !data.length) {
    alert('No data available to export');
    return;
  }

  // Extract header labels and keys
  const headerKeys = Object.keys(headers);
  const headerLabels = Object.values(headers);

  const csvRows = [];
  // Add header row
  csvRows.push(headerLabels.map((label) => `"${label.replace(/"/g, '""')}"`).join(','));

  // Add data rows
  for (const row of data) {
    const values = headerKeys.map((key) => {
      let val = row[key];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\r\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Compute stock status given quantity and minimum threshold
 */
export const getStockStatus = (qty, minStock) => {
  const current = Number(qty) || 0;
  const min = Number(minStock) || 0;
  if (current <= 0) return 'Out of Stock';
  if (current <= min) return 'Low Stock';
  return 'In Stock';
};
