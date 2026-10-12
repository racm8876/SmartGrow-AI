import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Building,
  FileText,
  Clock,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import * as api from '../../services/api';

export const CustomerManagement: React.FC = () => {
  const { customers, invoices, quotations, addCustomer, editCustomer, removeCustomer, addToast, setActivePage } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  const openNewModal = () => {
    setEditingCustomer(null);
    setName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setGstin('');
    setAddress('');
    setCity('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setCompanyName(c.companyName || '');
    setPhone(c.phone);
    setEmail(c.email || '');
    setGstin(c.gstin || '');
    setAddress(c.address || '');
    setCity(c.city || '');
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      addToast('error', 'Customer name and phone number are required.');
      return;
    }

    try {
      if (editingCustomer) {
        await editCustomer(editingCustomer.id, {
          name,
          companyName,
          phone,
          email,
          gstin,
          address,
          city,
          notes,
        });
        addToast('success', 'Customer record updated in Firestore.');
        setIsModalOpen(false);
      } else {
        await addCustomer({
          name,
          companyName,
          phone,
          email,
          gstin,
          address,
          city,
          notes,
        });
        addToast('success', 'New customer added to directory and saved to Firestore.');
        setIsModalOpen(false);
      }
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this customer?')) return;
    try {
      await removeCustomer(id);
      addToast('info', 'Customer removed from Firestore.');
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      c.phone.includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Customer Directory & CRM</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain client accounts, contact channels, GSTIN records, transaction histories, and outstanding payment ledgers.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, company, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Grid of Customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            No customers found. Click <strong>"Add Customer"</strong> to create a new client profile.
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const clientInvoices = invoices.filter(
              (inv) => inv.customerId === cust.id || inv.customerName.toLowerCase() === (cust.companyName || cust.name).toLowerCase()
            );

            return (
              <div
                key={cust.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {cust.companyName || cust.name}
                      </h3>
                      {cust.companyName && (
                        <div className="text-xs text-slate-500 truncate mt-0.5">Contact: {cust.name}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(cust)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cust.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{cust.phone}</span>
                    </div>
                    {cust.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.email}</span>
                      </div>
                    )}
                    {cust.gstin && (
                      <div className="text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300">
                        GSTIN: {cust.gstin}
                      </div>
                    )}
                  </div>

                  {/* Notes snippet */}
                  {cust.notes && (
                    <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 italic line-clamp-2">
                      "{cust.notes}"
                    </div>
                  )}
                </div>

                {/* Ledger Financial Overview */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-500">Total Billed:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      ₹{cust.totalInvoiced.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Outstanding:</span>
                    <span
                      className={`font-mono font-bold tabular-nums ${
                        cust.pendingBalance > 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      ₹{cust.pendingBalance.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-blue-600">
                    <span>{clientInvoices.length} invoices on file</span>
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>View History</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingCustomer ? 'Edit Customer Information' : 'Add New Customer Profile'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Verma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business / Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. The Artisan Boutique"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@domain.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="27AABCT8899K1Z5"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai, Maharashtra"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, locality, pin code"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Notes & Preferences
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Prefers WhatsApp communication; clears bills on the 10th of each month."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
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
                  {editingCustomer ? 'Update Client' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER HISTORY DRAWER / MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedCustomer.companyName || selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-500">Customer Transaction History & Billing Ledger</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-500">Phone: </span>
                <span className="font-mono text-slate-900 dark:text-white">{selectedCustomer.phone}</span>
              </div>
              <div>
                <span className="text-slate-500">Email: </span>
                <span className="text-slate-900 dark:text-white">{selectedCustomer.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500">Total Invoiced: </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₹{selectedCustomer.totalInvoiced.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Pending Dues: </span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  ₹{selectedCustomer.pendingBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Associated Invoices
              </h4>
              {invoices.filter((i) => i.customerId === selectedCustomer.id || i.customerName === (selectedCustomer.companyName || selectedCustomer.name)).length === 0 ? (
                <div className="text-xs text-slate-400 py-3 text-center">No invoices created for this client yet.</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  {invoices
                    .filter((i) => i.customerId === selectedCustomer.id || i.customerName === (selectedCustomer.companyName || selectedCustomer.name))
                    .map((inv) => (
                      <div key={inv.id} className="p-3 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white font-mono">{inv.invoiceNumber}</div>
                          <div className="text-[11px] text-slate-500">Issued: {inv.issueDate} · Due: {inv.dueDate}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            ₹{inv.totalAmount.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
