import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  QrCode, 
  Banknote, 
  Building2, 
  Copy, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink,
  Info,
  CheckCircle2,
  Lock,
  Sparkles,
  CreditCard,
  Truck,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CustomerDetails, PaymentMethod, Order } from '../types';
import { formatINR, buildUpiUri, buildAppUpiUri, generateQrDataUrl } from '../utils/upi';

interface CheckoutModalProps {
  isOpen: boolean;
  initialPaymentMethod?: PaymentMethod;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  initialPaymentMethod = 'upi',
  onClose,
  onOrderSuccess
}) => {
  const { cart, getCartTotal, settings, createOrder, verifiedCustomer } = useStore();

  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onlineTab, setOnlineTab] = useState<'apps' | 'qr' | 'bank_transfer'>('apps');
  const [paymentAppLaunched, setPaymentAppLaunched] = useState<string | null>(null);

  // Explicit Payment Method State: Defaults strictly to initialPaymentMethod or 'upi'
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialPaymentMethod);

  // Form State
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: verifiedCustomer?.cadetName || '',
    phone: verifiedCustomer?.phone || '',
    email: '',
    cadetNumber: '',
    battalionUnit: '',
    wing: 'army',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    notes: ''
  });

  // Sync if verifiedCustomer changes
  useEffect(() => {
    if (verifiedCustomer) {
      setCustomer(prev => ({
        ...prev,
        phone: prev.phone || verifiedCustomer.phone,
        fullName: prev.fullName || verifiedCustomer.cadetName || ''
      }));
    }
  }, [verifiedCustomer]);

  // Reset step & sync payment method whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setPaymentMethod(initialPaymentMethod || 'upi');
      setOnlineTab('apps');
      setPaymentAppLaunched(null);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialPaymentMethod]);

  const [utrNumber, setUtrNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { subtotal, discount, shipping } = getCartTotal();
  const isCod = paymentMethod === 'cod';
  const codFee = isCod && settings.codEnabled ? settings.codExtraFee : 0;
  const totalAmount = subtotal - discount + shipping + codFee;

  // Generate temporary order ref for the UPI payment intent
  const [tempOrderCode] = useState(() => `NCC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);

  // Build UPI URIs & QR Code
  useEffect(() => {
    if (paymentMethod === 'upi') {
      const upiUri = buildUpiUri({
        upiId: settings.upiId,
        payeeName: settings.accountHolderName || settings.storeName,
        amount: totalAmount,
        orderId: tempOrderCode
      });

      generateQrDataUrl(upiUri).then(url => {
        setQrDataUrl(url);
      });
    }
  }, [paymentMethod, totalAmount, settings.upiId, settings.accountHolderName, tempOrderCode]);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const validateDetails = () => {
    const errs: Record<string, string> = {};
    if (!customer.fullName.trim()) errs.fullName = 'Cadet Name is required';
    if (!customer.phone.trim() || customer.phone.length < 10) errs.phone = 'Valid 10-digit mobile number required';
    if (!customer.addressLine.trim()) errs.addressLine = 'Delivery address is required';
    if (!customer.city.trim()) errs.city = 'City is required';
    if (!customer.state.trim()) errs.state = 'State is required';
    if (!customer.pincode.trim() || customer.pincode.length < 6) errs.pincode = 'Valid 6-digit PIN code required';
    if (!customer.battalionUnit.trim()) errs.battalionUnit = 'NCC Unit / Battalion name required (e.g. 19 UP BN)';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDetails()) {
      setStep('payment');
    }
  };

  // Launch Payment App
  const handleLaunchPaymentApp = (app: 'phonepe' | 'gpay' | 'paytm' | 'bhim' | 'universal', appLabel: string) => {
    const uri = buildAppUpiUri(app, {
      upiId: settings.upiId,
      payeeName: settings.accountHolderName || settings.storeName,
      amount: totalAmount,
      orderId: tempOrderCode
    });

    setPaymentAppLaunched(appLabel);

    // Open user's payment app directly on their mobile device
    window.location.href = uri;
  };

  // Only place order AFTER customer initiates/completes payment
  const handleCompleteOrder = () => {
    setIsSubmitting(true);

    const activePaymentMethod: PaymentMethod = paymentMethod;

    setTimeout(() => {
      const newOrder = createOrder({
        customer,
        items: cart,
        subtotal,
        discount,
        shipping,
        codFee: activePaymentMethod === 'cod' ? codFee : 0,
        totalAmount: activePaymentMethod === 'cod' ? (subtotal - discount + shipping + codFee) : (subtotal - discount + shipping),
        paymentMethod: activePaymentMethod,
        paymentStatus: activePaymentMethod === 'cod' ? 'cod_pending' : 'pending',
        orderStatus: 'pending_payment',
        utrNumber: utrNumber.trim() || undefined
      });

      setIsSubmitting(false);
      onClose();
      onOrderSuccess(newOrder);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-stone-900 text-white rounded-t-3xl border-b border-stone-800">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>SECURE CADET STORE CHECKOUT</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black">
                {step === 'details' ? 'Delivery Address & Payment Choice' : 'Payment Gateway (Pay Before Order)'}
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                {step === 'details' 
                  ? 'Fill cadet delivery address and pick your payment method' 
                  : 'Pay directly via PhonePe, GPay, Paytm, or choose Cash on Delivery'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'details' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                1
              </span>
              <div className="w-4 h-0.5 bg-stone-700"></div>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 'payment' ? 'bg-red-600 text-white' : 'bg-stone-800 text-stone-400'}`}>
                2
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Cadet Information, Address & Payment Selection */}
        {step === 'details' && (
          <form onSubmit={handleProceedToPayment} className="p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Cadet Name */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Cadet Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cadet Rahul Sharma"
                  value={customer.fullName}
                  onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                  className={`w-full px-3 py-2 bg-stone-50 border rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:bg-white ${
                    errors.fullName ? 'border-red-500' : 'border-stone-300 focus:border-red-800'
                  }`}
                />
                {errors.fullName && <p className="text-[10px] text-red-600 mt-0.5">{errors.fullName}</p>}
              </div>

              {/* Mobile Phone */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700">
                    Mobile Number (WhatsApp updates) *
                  </label>
                  {verifiedCustomer && verifiedCustomer.phone === customer.phone && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>OTP Verified</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">+91</span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '') })}
                    className={`w-full pl-11 pr-3 py-2 bg-stone-50 border rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:bg-white ${
                      errors.phone ? 'border-red-500' : 'border-stone-300 focus:border-red-800'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-[10px] text-red-600 mt-0.5">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Email Address (For Invoice)
                </label>
                <input
                  type="email"
                  placeholder="cadet.name@gmail.com"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:bg-white focus:border-red-800"
                />
              </div>

              {/* NCC Wing */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  NCC Wing *
                </label>
                <select
                  value={customer.wing}
                  onChange={(e) => setCustomer({ ...customer, wing: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:bg-white focus:border-red-800"
                >
                  <option value="army">Army Wing (SD / SW / JD / JW)</option>
                  <option value="navy">Navy Wing (Naval Cadets)</option>
                  <option value="air">Air Wing (Air Cadets)</option>
                </select>
              </div>

              {/* Battalion Unit */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  NCC Battalion / Unit *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 19 UP BN NCC or 1 GUJ NAVAL"
                  value={customer.battalionUnit}
                  onChange={(e) => setCustomer({ ...customer, battalionUnit: e.target.value })}
                  className={`w-full px-3 py-2 bg-stone-50 border rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:bg-white ${
                    errors.battalionUnit ? 'border-red-500' : 'border-stone-300 focus:border-red-800'
                  }`}
                />
                {errors.battalionUnit && <p className="text-[10px] text-red-600 mt-0.5">{errors.battalionUnit}</p>}
              </div>

              {/* Regimental Number */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Regimental Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UP/24/SDA/112345"
                  value={customer.cadetNumber}
                  onChange={(e) => setCustomer({ ...customer, cadetNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:bg-white focus:border-red-800 uppercase"
                />
              </div>

            </div>

            {/* Address */}
            <div className="space-y-4 pt-2 border-t border-stone-200">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                Shipping &amp; Delivery Address
              </span>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  House / Room / Hostel No., Street &amp; Landmark *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room 102, Cadet Hostel, University Campus, MG Road"
                  value={customer.addressLine}
                  onChange={(e) => setCustomer({ ...customer, addressLine: e.target.value })}
                  className={`w-full px-3 py-2 bg-stone-50 border rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:bg-white ${
                    errors.addressLine ? 'border-red-500' : 'border-stone-300 focus:border-red-800'
                  }`}
                />
                {errors.addressLine && <p className="text-[10px] text-red-600 mt-0.5">{errors.addressLine}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lucknow"
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className={`w-full px-3 py-2 bg-stone-50 border rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:bg-white ${
                      errors.city ? 'border-red-500' : 'border-stone-300 focus:border-red-800'
                    }`}
                  />
                  {errors.city && <p className="text-[10px] text-red-600 mt-0.5">{errors.city}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Uttar Pradesh"
                    value={customer.state}
                    onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                    className={`w-full px-3 py-2 bg-stone-50 border rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:bg-white ${
                      errors.state ? 'border-red-500' : 'border-stone-300 focus:border-red-800'
                    }`}
                  />
                  {errors.state && <p className="text-[10px] text-red-600 mt-0.5">{errors.state}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    placeholder="226001"
                    maxLength={6}
                    value={customer.pincode}
                    onChange={(e) => setCustomer({ ...customer, pincode: e.target.value.replace(/\D/g, '') })}
                    className={`w-full px-3 py-2 bg-stone-50 border rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:bg-white ${
                      errors.pincode ? 'border-red-500' : 'border-stone-300 focus:border-red-800'
                    }`}
                  />
                  {errors.pincode && <p className="text-[10px] text-red-600 mt-0.5">{errors.pincode}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Delivery Notes / Camp Date (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Urgent required before CATC Camp departure on Monday"
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:bg-white"
                />
              </div>
            </div>

            {/* Direct Step 1 Payment Option Selector */}
            <div className="pt-3 border-t border-stone-200 space-y-2">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                How would you like to pay? *
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Pay Online Option Card */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === 'upi'
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="step1_payment_method"
                    id="step1_online"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 font-extrabold text-xs text-stone-900">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Pay Online via Gateway</span>
                      <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                        PhonePe • GPay • Paytm
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Directly opens your mobile payment app before placing order
                    </p>
                  </div>
                </div>

                {/* 2. Cash on Delivery Option Card */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    paymentMethod === 'cod'
                      ? 'border-amber-600 bg-amber-50/80 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="step1_payment_method"
                    id="step1_cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 font-extrabold text-xs text-stone-900">
                      <Banknote className="w-4 h-4 text-amber-600" />
                      <span>Cash on Delivery</span>
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5">
                      Pay cash to courier delivery agent at your doorstep
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Button */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Total Amount: <strong className="text-stone-900 text-sm">{formatINR(totalAmount)}</strong>
              </span>

              <button
                type="submit"
                className={`px-6 py-3 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all ${
                  paymentMethod === 'cod' ? 'bg-amber-700 hover:bg-amber-800' : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                <span>
                  {paymentMethod === 'cod' ? 'Continue with Cash on Delivery' : 'Open Payment Gateway'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Payment Gateway (Customer Pays Directly in Mobile Payment App Before Order Is Placed) */}
        {step === 'payment' && (
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Payment Method Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    paymentMethod === 'upi'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Online Payment Gateway</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    paymentMethod === 'cod'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              <span className="text-xs font-black text-stone-900">
                Amount: <span className="text-emerald-800">{formatINR(totalAmount)}</span>
              </span>
            </div>

            {/* GATEWAY VIEW A: Online Payment Gateway (Direct to Mobile Apps) */}
            {paymentMethod === 'upi' && (
              <div className="space-y-5">
                
                {/* Gateway Safety Banner */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950">
                    <p className="font-extrabold text-sm">Direct Cadet Bank Payment Gateway</p>
                    <p className="text-emerald-800 text-[11px] mt-0.5">
                      Your order is <strong>NOT placed yet</strong>. Tap your mobile payment app below to transfer directly into the official merchant bank account with zero fees.
                    </p>
                  </div>
                </div>

                {/* Sub-Tabs: Mobile Apps vs QR Code vs NetBanking */}
                <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                  <button
                    type="button"
                    onClick={() => setOnlineTab('apps')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      onlineTab === 'apps' 
                        ? 'bg-stone-900 text-white shadow-xs' 
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recommended Apps</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOnlineTab('qr')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      onlineTab === 'qr' 
                        ? 'bg-stone-900 text-white shadow-xs' 
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Scan QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOnlineTab('bank_transfer')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      onlineTab === 'bank_transfer' 
                        ? 'bg-stone-900 text-white shadow-xs' 
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Bank IMPS / NEFT</span>
                  </button>
                </div>

                {/* 1. Mobile App Recommendation Grid (User Requested Direct Mobile Payment App Takeover) */}
                {onlineTab === 'apps' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* PhonePe Direct App Intent */}
                      <button
                        type="button"
                        onClick={() => handleLaunchPaymentApp('phonepe', 'PhonePe')}
                        className="p-3.5 rounded-2xl border-2 border-purple-500/30 hover:border-purple-600 bg-purple-50/60 hover:bg-purple-100/70 text-left transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                            पे
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-purple-950 group-hover:text-purple-700 transition-colors">
                              PhonePe
                            </h4>
                            <p className="text-[11px] text-purple-800">
                              Instant UPI payment app
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-xs group-hover:scale-105 transition-transform">
                          Pay Now
                        </span>
                      </button>

                      {/* Google Pay Direct App Intent */}
                      <button
                        type="button"
                        onClick={() => handleLaunchPaymentApp('gpay', 'Google Pay')}
                        className="p-3.5 rounded-2xl border-2 border-blue-500/30 hover:border-blue-600 bg-blue-50/60 hover:bg-blue-100/70 text-left transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-stone-300 text-blue-600 font-black text-sm flex items-center justify-center shadow-xs">
                            <span className="text-blue-500 font-extrabold">G</span>
                            <span className="text-red-500 font-extrabold">P</span>
                            <span className="text-amber-500 font-extrabold">a</span>
                            <span className="text-emerald-500 font-extrabold">y</span>
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-blue-950 group-hover:text-blue-700 transition-colors">
                              Google Pay
                            </h4>
                            <p className="text-[11px] text-blue-800">
                              Direct bank UPI checkout
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs group-hover:scale-105 transition-transform">
                          Pay Now
                        </span>
                      </button>

                      {/* Paytm Direct App Intent */}
                      <button
                        type="button"
                        onClick={() => handleLaunchPaymentApp('paytm', 'Paytm')}
                        className="p-3.5 rounded-2xl border-2 border-sky-500/30 hover:border-sky-600 bg-sky-50/60 hover:bg-sky-100/70 text-left transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            Paytm
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-sky-950 group-hover:text-sky-700 transition-colors">
                              Paytm UPI
                            </h4>
                            <p className="text-[11px] text-sky-800">
                              Instant wallet &amp; UPI
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold text-xs group-hover:scale-105 transition-transform">
                          Pay Now
                        </span>
                      </button>

                      {/* Universal Any UPI App Intent (BHIM, CRED, Amazon Pay, Banking App) */}
                      <button
                        type="button"
                        onClick={() => handleLaunchPaymentApp('universal', 'Any UPI App')}
                        className="p-3.5 rounded-2xl border-2 border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 text-left transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 font-black text-xs flex items-center justify-center shadow-xs">
                            UPI
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-stone-900">
                              Other UPI App
                            </h4>
                            <p className="text-[11px] text-stone-600">
                              BHIM, CRED, Amazon Pay, Bank
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-white font-bold text-xs group-hover:scale-105 transition-transform">
                          Open App
                        </span>
                      </button>

                    </div>

                    {/* Notification if an app was clicked */}
                    {paymentAppLaunched && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 flex items-center justify-between gap-2 text-xs text-amber-950 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>
                            <strong>{paymentAppLaunched} App launched!</strong> Complete payment in your app and enter reference number below to confirm.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* VPA Copy Pill */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                      <span className="text-stone-600">Seller UPI ID: <strong className="font-mono text-stone-900">{settings.upiId}</strong></span>
                      <button
                        type="button"
                        onClick={() => handleCopy(settings.upiId, 'upiId')}
                        className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-300 rounded font-bold text-[11px] text-stone-700 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'upiId' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'upiId' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. QR Code Scanner View */}
                {onlineTab === 'qr' && (
                  <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 flex flex-col sm:flex-row items-center gap-5">
                    <div className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-stone-200 shadow-xs shrink-0">
                      {qrDataUrl ? (
                        <img 
                          src={qrDataUrl} 
                          alt="Dynamic UPI QR Code" 
                          className="w-44 h-44 rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="w-44 h-44 bg-stone-100 flex items-center justify-center rounded-lg text-xs text-stone-400">
                          Generating QR...
                        </div>
                      )}
                      <span className="text-xs font-bold text-stone-900 mt-2">
                        Exact: {formatINR(totalAmount)}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-stone-700">
                      <h4 className="font-extrabold text-sm text-stone-900">
                        Scan with any UPI Scanner
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Open Google Pay, PhonePe, Paytm, or your banking app, scan this QR code, and pay the exact amount.
                      </p>
                      <div className="p-2.5 bg-white rounded-lg border border-stone-200 font-mono text-[11px] flex justify-between items-center">
                        <span>VPA: <strong>{settings.upiId}</strong></span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Verified</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Direct Bank Transfer (IMPS / NEFT) View */}
                {onlineTab === 'bank_transfer' && (
                  <div className="bg-white rounded-xl border border-blue-200 p-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Beneficiary Name:</span>
                      <strong className="text-stone-900 font-bold">{settings.accountHolderName}</strong>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Bank Name &amp; Branch:</span>
                      <strong className="text-stone-900">{settings.bankName} ({settings.bankBranch})</strong>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <strong className="font-mono text-sm text-stone-900">{settings.bankAccountNumber}</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(settings.bankAccountNumber, 'acc')}
                          className="p-1 rounded hover:bg-stone-100 text-stone-600 cursor-pointer"
                          title="Copy Account Number"
                        >
                          {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-stone-500">IFSC Code:</span>
                      <div className="flex items-center gap-2">
                        <strong className="font-mono text-sm text-stone-900">{settings.bankIfscCode}</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(settings.bankIfscCode, 'ifsc')}
                          className="p-1 rounded hover:bg-stone-100 text-stone-600 cursor-pointer"
                          title="Copy IFSC Code"
                        >
                          {copiedField === 'ifsc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* UTR / Transaction Reference Input (After Payment in App) */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-900 block">
                      UPI Reference / UTR Number (From Payment App Receipt)
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">12-Digits</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 412891002341 (Shown in PhonePe / GPay receipt)"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/\s+/g, ''))}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-hidden focus:border-emerald-600"
                  />
                  <p className="text-[11px] text-stone-500">
                    Entering your UTR number speeds up instant dispatch approval by our store team.
                  </p>
                </div>

              </div>
            )}

            {/* GATEWAY VIEW B: Cash on Delivery (COD) Active */}
            {paymentMethod === 'cod' && (
              <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-amber-950">
                      Cash on Delivery (Pay at Doorstep)
                    </h4>
                    <p className="text-xs text-amber-900 mt-0.5">
                      Pay cash directly to the courier delivery agent when your uniform package is delivered.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-amber-200 text-xs text-stone-700 space-y-2">
                  <div className="flex justify-between">
                    <span>Recipient Cadet:</span>
                    <strong className="text-stone-900">{customer.fullName} (+91 {customer.phone})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Location:</span>
                    <span className="text-stone-600 text-right">{customer.addressLine}, {customer.city} ({customer.pincode})</span>
                  </div>
                  {settings.codExtraFee > 0 && (
                    <div className="flex justify-between text-amber-800 pt-1.5 border-t border-stone-100">
                      <span>COD Courier Handling Fee:</span>
                      <strong>+₹{settings.codExtraFee}</strong>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-900 font-bold pt-1.5 border-t border-stone-100 text-sm">
                    <span>Cash Payable at Doorstep:</span>
                    <strong className="text-red-800 font-black text-base">{formatINR(totalAmount)}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-amber-900 bg-amber-100/60 p-2.5 rounded-lg border border-amber-200">
                  ℹ️ Our logistics dispatch team will call you on +91 {customer.phone} to confirm before shipping your uniform package.
                </p>
              </div>
            )}

            {/* Action Buttons: Customer Places Order ONLY AFTER Payment */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Address</span>
              </button>

              <button
                type="button"
                onClick={handleCompleteOrder}
                disabled={isSubmitting}
                className={`px-8 py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                  paymentMethod === 'cod'
                    ? 'bg-amber-700 hover:bg-amber-800 shadow-amber-900/20'
                    : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-900/20'
                }`}
              >
                {isSubmitting ? (
                  <span>Confirming Order...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {paymentMethod === 'cod' 
                        ? `Confirm & Place COD Order (${formatINR(totalAmount)})` 
                        : `Payment Made • Complete Order (${formatINR(totalAmount)})`}
                    </span>
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
