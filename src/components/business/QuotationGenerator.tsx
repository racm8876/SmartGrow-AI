import React, { useState } from 'react';
import {
  FileCheck,
  Plus,
  Trash2,
  Printer,
  ArrowRight,
  Search,
  Check,
  X,
  Clock,
  Send,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Quotation, InvoiceItem, QuotationStatus } from '../../types';
import * as api from '../../services/api';

export const QuotationGenerator: React.FC = () => {
  const { quotations, customers, user, refreshQuotations, refreshInvoices, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printingQuotation, setPrintingQuotation] = useState<Quotation | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [isGstRegistered, setIsGstRegistered] = useState(true);
  const [notes, setNotes] = useState('Estimate valid for 15 days. 50% advance upon contract sign-off.');
  const [terms, setTerms] = useState(
    'THIS DOCUMENT IS AN ESTIMATE / QUOTATION AND NOT A TAX INVOICE. Prices subject to formal acceptance.'
  );

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'qitem_1',
      description: 'Custom Mobile App / Portal Development',
      hsnSac: '998314',
      quantity: 1,
      unitPrice: 35000,
      taxRate: 18,
      discountPercent: 5,
      total: 39235,
    },
  ]);

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
        id: `qitem_${Date.now()}`,
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

  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
  const totalDiscount = items.reduce((sum, item) => {
    const base = Number(item.quantity || 0) * Number(item.unitPrice || 0);
    return sum + (base * Number(item.discountPercent || 0)) / 100;
  }, 0);
  const totalTax = isGstRegistered
    ? items.reduce((sum, item) => {
        const base = Number(item.quantity || 0) * Number(item.unitPrice || 0);
        const discounted = base - (base * Number(item.discountPercent || 0)) / 100;
        return sum + (discounted * Number(item.taxRate || 0)) / 100;
      }, 0)
    : 0;
  const grandTotal = Math.round(subtotal - totalDiscount + totalTax);

  const handleSelectCustomer = (custId: string) => {
    const cust = customers.find((c) => c.id === custId);
    if (!cust) return;
    setCustomerName(cust.companyName || cust.name);
    setCustomerEmail(cust.email || '');
    setCustomerPhone(cust.phone || '');
    setCustomerAddress(cust.address || '');
    setCustomerGstin(cust.gstin || '');
  };

  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      addToast('error', 'Customer name is required.');
      return;
    }

    try {
      const res = await api.createQuotation({
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        customerGstin,
        isGstRegistered,
        issueDate,
        validUntil,
        items,
        subtotal,
        taxAmount: totalTax,
        discountAmount: totalDiscount,
        totalAmount: grandTotal,
        status: 'sent',
        notes,
        terms,
      });

      if (res.success) {
        addToast('success', `Quotation ${res.data.quotationNumber} generated.`);
        setIsModalOpen(false);
        await refreshQuotations();
      }
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleConvertToInvoice = async (quot: Quotation) => {
    try {
      const res = await api.convertQuotationToInvoice(quot.id);
      if (res.success) {
        addToast('success', `Quotation converted to Invoice ${res.data.invoice.invoiceNumber}!`);
        await Promise.all([refreshQuotations(), refreshInvoices()]);
      }
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quotation?')) return;
    try {
      await api.deleteQuotation(id);
      addToast('info', 'Quotation removed.');
      await refreshQuotations();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span>Quotations & Cost Estimates</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build formal price proposals labeled clearly as estimates, with one-click conversion to GST Tax Invoices.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by quote # or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto w-full sm:w-auto overflow-x-auto">
          {['all', 'sent', 'accepted', 'converted', 'draft'].map((status) => (
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

      {/* Quotations List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {filteredQuotations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No quotations found. Click <strong>"New Quotation"</strong> to draft a formal proposal.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Quote #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Issued</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4 text-right">Estimate (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredQuotations.map((quot) => (
                  <tr key={quot.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      {quot.quotationNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      {quot.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">{quot.issueDate}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">{quot.validUntil}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      ₹{quot.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                          quot.status === 'converted'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : quot.status === 'accepted'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {quot.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {quot.status !== 'converted' && (
                          <button
                            onClick={() => handleConvertToInvoice(quot)}
                            className="px-2 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 rounded flex items-center gap-1 transition-colors"
                            title="Convert into GST Invoice"
                          >
                            <span>Convert to Invoice</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => setPrintingQuotation(quot)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 rounded"
                          title="Print Estimate"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(quot.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                          title="Delete"
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

      {/* CREATE QUOTATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full my-8 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Cost Quotation</h3>
                <p className="text-xs text-slate-500">Formal price estimate with validity expiration and conversion rules</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuotation} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Customer Name *</label>
                    {customers.length > 0 && (
                      <select
                        onChange={(e) => handleSelectCustomer(e.target.value)}
                        className="text-[10px] text-blue-600 bg-transparent border-0 cursor-pointer"
                      >
                        <option value="">Select Existing Client</option>
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
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Quotation Date
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
                      Estimate Valid Until
                    </label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Proposed Deliverables & Scope
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
                        <th className="py-2.5 px-3">Scope Description</th>
                        <th className="py-2.5 px-2 w-16">Qty</th>
                        <th className="py-2.5 px-2 w-28">Rate (₹)</th>
                        <th className="py-2.5 px-2 w-20">GST %</th>
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
                              placeholder="Service or milestone description"
                              className="w-full px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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

              {/* Terms and Disclaimer */}
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
                  <strong>Mandatory Estimate Disclaimer:</strong> This document is automatically stamped as an estimate and quotation. It does not establish tax liability until converted to a final invoice.
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Special Conditions / Validity Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

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
                  Save & Issue Quotation (₹{grandTotal.toLocaleString('en-IN')})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE QUOTATION VIEW */}
      {printingQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full my-8 p-8 shadow-2xl relative">
            <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm">Quotation Preview & Print</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Quotation</span>
                </button>
                <button
                  onClick={() => setPrintingQuotation(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 text-xs text-slate-800 leading-normal">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {user?.businessProfile?.companyName || 'SmartGrow Business Solutions'}
                  </h2>
                  <p className="text-slate-600 mt-1 max-w-xs">{user?.businessProfile?.address || 'India'}</p>
                  <p className="text-slate-600">Phone: {user?.businessProfile?.phone || '+91 98765 43210'}</p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold uppercase tracking-wider text-amber-600">
                    PRICE ESTIMATE / QUOTATION
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">
                    {printingQuotation.quotationNumber}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1">Date: {printingQuotation.issueDate}</div>
                  <div className="text-slate-600 font-semibold text-[11px]">
                    Valid Until: {printingQuotation.validUntil}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Prepared For
                  </div>
                  <div className="font-bold text-sm text-slate-900">{printingQuotation.customerName}</div>
                  {printingQuotation.customerPhone && (
                    <div className="text-slate-600 mt-0.5">Phone: {printingQuotation.customerPhone}</div>
                  )}
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Scope Description</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2 text-right">Unit Rate</th>
                    <th className="py-2 px-2 text-center">GST %</th>
                    <th className="py-2 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {printingQuotation.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{item.description}</td>
                      <td className="py-2 px-2 text-center font-mono">{item.quantity}</td>
                      <td className="py-2 px-2 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-2 text-center font-mono">{item.taxRate}%</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        ₹{item.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between pt-2">
                <div className="max-w-xs text-[11px] text-slate-600 space-y-1">
                  <div><strong>Notes:</strong> {printingQuotation.notes}</div>
                </div>

                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Subtotal:</span>
                    <span className="font-mono">₹{printingQuotation.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Applicable Taxes:</span>
                    <span className="font-mono">₹{printingQuotation.taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1.5 flex justify-between font-bold text-sm text-slate-900">
                    <span>Total Estimate:</span>
                    <span className="font-mono text-blue-700">
                      ₹{printingQuotation.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                <strong>Legal Notice:</strong> {printingQuotation.terms}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
