import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, AlertTriangle, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import * as api from '../../services/api';

export const BillingModal: React.FC = () => {
  const { isBillingModalOpen, closeBillingModal, selectedUpgradeTier, user, addToast, updateUserPlanLocal, refreshUserData } = useApp();
  const [tier, setTier] = useState<'pro' | 'business'>(selectedUpgradeTier);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<any>(null);

  if (!isBillingModalOpen) return null;

  const isPro = tier === 'pro';
  const price = isPro ? '₹199' : '₹499';
  const planName = isPro ? 'Pro Growth Plan' : 'Business Scale Plan';

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Create order on server
      const orderRes = await api.createBillingOrder(tier);
      
      // 2. Simulate payment verification
      const verifyRes = await api.verifyBillingPayment({
        planTier: tier,
        orderId: orderRes.orderId,
        paymentId: `pay_sim_${Date.now()}`,
      });

      if (verifyRes.success) {
        updateUserPlanLocal(tier);
        await refreshUserData();
        setOrderReceipt(verifyRes.receipt);
        addToast('success', `Congratulations! Upgraded to ${planName} successfully.`);
      }
    } catch (err: any) {
      addToast('error', err.message || 'Payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setOrderReceipt(null);
    closeBillingModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {orderReceipt ? 'Payment Confirmation' : 'Upgrade Your Plan'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Empower your business operations and career trajectory
            </p>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderReceipt ? (
          /* Receipt Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">Subscription Active</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You are now subscribed to the <strong className="text-slate-900 dark:text-white">{planName}</strong>.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 text-left text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Receipt Number:</span>
                <span className="font-mono text-slate-900 dark:text-white">{orderReceipt.paymentId}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Billing Cycle:</span>
                <span className="font-medium text-slate-900 dark:text-white">Monthly ({price}/mo)</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Activated on Server</span>
              </div>
            </div>
            <button
              onClick={resetAndClose}
              className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          /* Selection Screen */
          <div className="p-6 space-y-5">
            {/* Tier Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setTier('pro')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                  isPro
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Pro Plan · ₹199/mo
              </button>
              <button
                type="button"
                onClick={() => setTier('business')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                  !isPro
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Business Plan · ₹499/mo
              </button>
            </div>

            {/* Plan Highlights */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{planName}</span>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{price}</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {isPro ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span><strong>150 AI Generations</strong> per month (10x Free)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Up to <strong>100 GST Invoices & Quotations</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Advanced ATS Resume & Job Description Analyzers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Full PDF / Print export with no watermark</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span><strong>500 AI Generations</strong> per month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span><strong>1,000 Invoices & Quotations</strong> with customer ledger</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Unlimited Customer Directory with payment tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Full Interview Practice AI Coach & Application Tracker</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Transparent Gateway Disclosure */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Demo Sandbox Checkout Mode</span>
              </div>
              <p className="leading-relaxed">
                To connect your live Razorpay Indian merchant account, add <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> to your <code>.env</code> file. For demonstration, this checkout simulates immediate verification and activates your tier on the backend.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="w-1/3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Confirm Upgrade to {price}/mo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
