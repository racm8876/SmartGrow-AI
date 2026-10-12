import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpDown,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Invoice, InvoiceItem, InvoiceStatus } from '../../types';
import * as api from '../../services/api';

export const InvoiceGenerator: React.FC = () => {
  const { invoices, customers, user, addToast, addInvoice, editInvoice, removeInvoice, refreshCustomers } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);

  // New Invoice Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [isGstRegistered, setIsGstRegistered] = useState(true);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('Thank you for your business. Please quote invoice number during payment.');
  const [terms, setTerms] = useState('Payment due within 15 days. Subject to local jurisdiction.');

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item_1',
      description: 'Web Application Development & SEO Setup',
      hsnSac: '998314',
      quantity: 1,
      unitPrice: 25000,
      taxRate: 18,
      discountPercent: 0,
      total: 29500,
    },
  ]);

  // Recalculate item line total
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        const qty = Number(updated.quantity || 0);
        const rate = Number(updated.unitPrice || 0);
        const discountPct = Number(updated.discountPercent || 0);
        const taxRate = isGstRegistered ? Number(updated.taxRate || 0) : 0;

        const baseTotal = qty * rate;
        const discountAmount = (baseTotal * discountPct) / 100;
        const discountedBase = baseTotal - discountAmount;
        const taxAmount = (discountedBase * taxRate) / 100;

        updated.total = Math.round(discountedBase + taxAmount);
        return updated;
      })
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item_${Date.now()}`,
        description: '',
        hsnSac: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: isGstRegistered ? (user?.businessProfile?.defaultGstRate || 18) : 0,
        discountPercent: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Totals Calculation
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity || 0);
    const rate = Number(item.unitPrice || 0);
    return sum + qty * rate;
  }, 0);

  const totalDiscount = items.reduce((sum, item) => {
    const qty = Number(item.quantity || 0);
    const rate = Number(item.unitPrice || 0);
    const discPct = Number(item.discountPercent || 0);
    return sum + (qty * rate * discPct) / 100;
  }, 0);

  const totalTax = isGstRegistered
    ? items.reduce((sum, item) => {
        const qty = Number(item.quantity || 0);
        const rate = Number(item.unitPrice || 0);
        const discPct = Number(item.discountPercent || 0);
        const discountedBase = qty * rate - (qty * rate * discPct) / 100;
        return sum + (discountedBase * Number(item.taxRate || 0)) / 100;
      }, 0)
    : 0;

  const grandTotal = Math.round(subtotal - totalDiscount + totalTax);

  // Auto-fill from customer selection
  const handleSelectCustomer = (custId: string) => {
    const cust = customers.find((c) => c.id === custId);
    if (!cust) return;
    setCustomerName(cust.companyName || cust.name);
    setCustomerEmail(cust.email || '');
    setCustomerPhone(cust.phone || '');
    setCustomerAddress(cust.address || '');
    setCustomerGstin(cust.gstin || '');
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      addToast('error', 'Customer name is required.');
      return;
    }

    try {
      const created = await addInvoice({
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        customerGstin,
        isGstRegistered,
        issueDate,
        dueDate,
        items,
        subtotal,
        taxAmount: totalTax,
        discountAmount: totalDiscount,
        totalAmount: grandTotal,
        status: 'pending',
        notes,
        terms,
      });

      addToast('success', `Invoice ${created.invoiceNumber} saved to Firestore!`);
      setIsModalOpen(false);
      await refreshCustomers();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to save invoice.');
    }
  };

  const handleStatusChange = async (inv: Invoice, newStatus: InvoiceStatus) => {
    try {
      await editInvoice(inv.id, { status: newStatus });
      addToast('success', `Invoice status updated to ${newStatus.toUpperCase()}`);
      await refreshCustomers();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update invoice.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await removeInvoice(id);
      addToast('info', 'Invoice removed from Firestore.');
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>GST Invoice Generator</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, manage, and print compliant Indian tax invoices with automatic tax and discount calculations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Tax Invoice</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice # or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto w-full sm:w-auto overflow-x-auto">
          {['all', 'paid', 'pending', 'overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No invoices match your filter. Click <strong>"New Tax Invoice"</strong> to generate one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-white">{inv.customerName}</div>
                      {inv.customerGstin && (
                        <div className="text-[10px] text-slate-400 font-mono">GSTIN: {inv.customerGstin}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">{inv.issueDate}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">{inv.dueDate}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={inv.status}
                        onChange={(e) => handleStatusChange(inv, e.target.value as InvoiceStatus)}
                        className={`text-[11px] font-semibold py-1 px-2 rounded-md border text-center capitalize cursor-pointer ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                            : inv.status === 'overdue'
                            ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300'
                            : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="draft">Draft</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPrintingInvoice(inv)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Print / Export PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE INVOICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full my-8 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Tax Invoice</h3>
                <p className="text-xs text-slate-500">Auto-calculated GST amounts, HSN/SAC codes, and line-item discounts</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="p-6 space-y-6">
              {/* Client Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Customer Name *</label>
                    {customers.length > 0 && (
                      <select
                        onChange={(e) => handleSelectCustomer(e.target.value)}
                        className="text-[10px] text-blue-600 bg-transparent border-0 cursor-pointer"
                      >
                        <option value="">Quick Select Client</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.companyName || c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer / Company Name"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Phone
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerGstin}
                    onChange={(e) => setCustomerGstin(e.target.value)}
                    placeholder="27AABCT8899K1Z5"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Billing Address
                    </label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Shop/Office Address, City, State, PIN"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* GST Toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
                <input
                  type="checkbox"
                  id="gstToggle"
                  checked={isGstRegistered}
                  onChange={(e) => setIsGstRegistered(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="gstToggle" className="cursor-pointer font-medium text-slate-800 dark:text-slate-200">
                  Enable GST Tax Calculation (Disable for composite / non-GST registered businesses)
                </label>
              </div>

              {/* Line Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Itemized Products / Services
                  </h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-2 w-24">HSN/SAC</th>
                        <th className="py-2.5 px-2 w-16">Qty</th>
                        <th className="py-2.5 px-2 w-28">Rate (₹)</th>
                        {isGstRegistered && <th className="py-2.5 px-2 w-20">GST %</th>}
                        <th className="py-2.5 px-2 w-20">Disc %</th>
                        <th className="py-2.5 px-3 text-right w-28">Total (₹)</th>
                        <th className="py-2.5 px-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Service or product title"
                              className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.hsnSac || ''}
                              onChange={(e) => updateItem(item.id, 'hsnSac', e.target.value)}
                              placeholder="998314"
                              className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                            />
                          </td>
                          {isGstRegistered && (
                            <td className="p-2">
                              <select
                                value={item.taxRate}
                                onChange={(e) => updateItem(item.id, 'taxRate', e.target.value)}
                                className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                              >
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                              </select>
                            </td>
                          )}
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercent || 0}
                              onChange={(e) => updateItem(item.id, 'discountPercent', e.target.value)}
                              className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                            />
                          </td>
                          <td className="p-2 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                            ₹{item.total.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculations Summary */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
                <div className="w-full sm:w-1/2 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Notes & Payment Details
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Terms & Conditions
                    </label>
                    <textarea
                      rows={2}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-80 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Total Discount:</span>
                      <span className="font-mono tabular-nums">-₹{totalDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {isGstRegistered && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Total GST (CGST + SGST):</span>
                      <span className="font-mono tabular-nums">₹{totalTax.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                    <span>Grand Total:</span>
                    <span className="font-mono tabular-nums text-blue-600 dark:text-blue-400">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Save & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE TAX INVOICE VIEW */}
      {printingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full my-8 p-8 shadow-2xl relative">
            <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm">Invoice Print / PDF Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setPrintingInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Standard Indian Tax Invoice Document Template */}
            <div className="space-y-6 text-xs text-slate-800 leading-normal">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {user?.businessProfile?.companyName || 'SmartGrow Business Solutions'}
                  </h2>
                  <p className="text-slate-600 mt-1 max-w-xs">{user?.businessProfile?.address || 'India'}</p>
                  <p className="text-slate-600">Phone: {user?.businessProfile?.phone || '+91 98765 43210'}</p>
                  {user?.businessProfile?.gstin && (
                    <p className="font-mono font-semibold text-slate-800 mt-0.5">
                      GSTIN: {user?.businessProfile?.gstin}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold uppercase tracking-wider text-blue-700">
                    {printingInvoice.isGstRegistered ? 'TAX INVOICE' : 'COMMERCIAL INVOICE'}
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">
                    {printingInvoice.invoiceNumber}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1">Date: {printingInvoice.issueDate}</div>
                  <div className="text-slate-500 text-[11px]">Due Date: {printingInvoice.dueDate}</div>
                </div>
              </div>

              {/* Billed To */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</div>
                  <div className="font-bold text-sm text-slate-900">{printingInvoice.customerName}</div>
                  {printingInvoice.customerAddress && (
                    <div className="text-slate-600 mt-0.5">{printingInvoice.customerAddress}</div>
                  )}
                  {printingInvoice.customerPhone && (
                    <div className="text-slate-600">Phone: {printingInvoice.customerPhone}</div>
                  )}
                </div>
                {printingInvoice.customerGstin && (
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Customer GSTIN
                    </div>
                    <div className="font-mono font-semibold text-slate-900">{printingInvoice.customerGstin}</div>
                  </div>
                )}
              </div>

              {/* Line Items */}
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-2 text-center">HSN/SAC</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2 text-right">Unit Rate</th>
                    {printingInvoice.isGstRegistered && <th className="py-2 px-2 text-center">GST %</th>}
                    <th className="py-2 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printingInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{item.description}</td>
                      <td className="py-2 px-2 text-center font-mono text-slate-600">{item.hsnSac || '-'}</td>
                      <td className="py-2 px-2 text-center font-mono">{item.quantity}</td>
                      <td className="py-2 px-2 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                      {printingInvoice.isGstRegistered && (
                        <td className="py-2 px-2 text-center font-mono">{item.taxRate}%</td>
                      )}
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        ₹{item.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Breakdown */}
              <div className="flex justify-between pt-2">
                <div className="max-w-xs space-y-2 text-[11px] text-slate-600">
                  <div>
                    <strong>Bank Account Details for Payment:</strong>
                    <div>Bank: {user?.businessProfile?.bankName || 'HDFC Bank'}</div>
                    <div>Account: {user?.businessProfile?.accountNumber || '50100234567890'}</div>
                    <div>IFSC: {user?.businessProfile?.ifscCode || 'HDFC0001234'}</div>
                  </div>
                  <div>
                    <strong>Notes:</strong> {printingInvoice.notes}
                  </div>
                </div>

                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{printingInvoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {printingInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Discount:</span>
                      <span className="font-mono">-₹{printingInvoice.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {printingInvoice.isGstRegistered && (
                    <div className="flex justify-between text-slate-600">
                      <span>GST Amount:</span>
                      <span className="font-mono">₹{printingInvoice.taxAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-300 pt-1.5 flex justify-between font-bold text-sm text-slate-900">
                    <span>Total Payable:</span>
                    <span className="font-mono text-blue-700">
                      ₹{printingInvoice.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Terms */}
              <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 text-center">
                {printingInvoice.terms} · This is a computer generated invoice requiring no physical signature.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
