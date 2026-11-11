import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  MapPin, 
  ShieldCheck,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';
import { formatINR } from '../utils/upi';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = ''
}) => {
  const { orders, getOrderById } = useStore();
  const [query, setQuery] = useState(initialOrderId);
  const [matchedOrder, setMatchedOrder] = useState<Order | undefined>(() => {
    if (initialOrderId) return getOrderById(initialOrderId);
    return orders.length > 0 ? orders[0] : undefined;
  });
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const found = getOrderById(query.trim());
      setMatchedOrder(found);
      setSearched(true);
    }
  };

  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment': return 0;
      case 'payment_verified': return 1;
      case 'processing': return 2;
      case 'dispatched': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentStep = matchedOrder ? getStatusStepIndex(matchedOrder.orderStatus) : 0;

  const steps = [
    { label: 'Order Placed', desc: 'Received & Queued' },
    { label: 'Payment Verified', desc: 'Bank Verified / COD Approved' },
    { label: 'Tailoring & Packing', desc: 'Name Tag & Uniform Boxed' },
    { label: 'Dispatched', desc: 'Shipped via Speed Post / Courier' },
    { label: 'Delivered', desc: 'Delivered to Cadet' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-stone-900 text-white rounded-t-3xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <Truck className="w-3.5 h-3.5" />
            <span>DISPATCH &amp; DELIVERY TRACKER</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Track Cadet Uniform Order
          </h2>
          <p className="text-stone-300 text-xs mt-1">
            Enter your Order ID (e.g. NCC-2026-8812) or 10-digit mobile number
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Order ID (NCC-...) or Mobile Number"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-800 text-white placeholder-stone-400 rounded-xl text-xs font-medium border border-stone-700 focus:outline-hidden focus:border-red-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              Track
            </button>
          </form>
        </div>

        {/* Order Details Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {matchedOrder ? (
            <>
              {/* Order Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Order Reference
                  </span>
                  <span className="text-lg font-black font-mono text-stone-900">
                    {matchedOrder.id}
                  </span>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Placed on {new Date(matchedOrder.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="flex sm:flex-col items-end gap-1">
                  <span className="text-xs font-bold text-stone-600">Total:</span>
                  <span className="text-lg font-black text-red-800">
                    {formatINR(matchedOrder.totalAmount)}
                  </span>
                  <span className="text-[11px] font-semibold text-stone-500 uppercase">
                    {matchedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Direct Bank / UPI'}
                  </span>
                </div>
              </div>

              {/* Status Stepper Tracker */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Delivery Timeline
                </span>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {steps.map((st, idx) => {
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;

                    return (
                      <div key={idx} className="relative flex items-start gap-3">
                        <div 
                          className={`absolute -left-6 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 ${
                            isDone 
                              ? 'bg-emerald-600 border-white text-white shadow-xs' 
                              : isCurrent
                              ? 'bg-amber-500 border-white text-white shadow-xs animate-pulse'
                              : 'bg-white border-stone-300 text-transparent'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${isDone ? 'text-stone-900' : 'text-stone-400'}`}>
                            {st.label}
                          </h4>
                          <p className="text-[11px] text-stone-500">{st.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courier Tracking Info if dispatched */}
              {matchedOrder.trackingNumber && (
                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-950 flex items-center justify-between">
                  <div>
                    <span className="font-bold block">
                      Dispatched via {matchedOrder.courierName || 'Speed Post (India Post)'}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-blue-900">
                      Tracking / AWB No: {matchedOrder.trackingNumber}
                    </span>
                  </div>
                </div>
              )}

              {/* Items in this order */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Uniform Items in Parcel
                </span>

                <div className="divide-y divide-stone-100">
                  {matchedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-200"
                        />
                        <div>
                          <h5 className="font-bold text-stone-900 line-clamp-1">{item.product.name}</h5>
                          <span className="text-[11px] text-stone-500">
                            Size: {item.selectedSize || 'Standard'} • Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">
                        {formatINR(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Cadet Regimental */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                <span className="font-bold text-stone-900">Recipient Cadet Details:</span>
                <p className="text-stone-700">
                  {matchedOrder.customer.fullName} • {matchedOrder.customer.battalionUnit} ({matchedOrder.customer.wing.toUpperCase()} WING)
                </p>
                {matchedOrder.customer.cadetNumber && (
                  <p className="text-stone-500 text-[11px]">
                    Cadet Regimental No: {matchedOrder.customer.cadetNumber}
                  </p>
                )}
                <p className="text-stone-600 text-[11px]">
                  {matchedOrder.customer.addressLine}, {matchedOrder.customer.city}, {matchedOrder.customer.state} - {matchedOrder.customer.pincode}
                </p>
              </div>
            </>
          ) : searched ? (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm">No Order Found</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                We couldn't find an order matching "{query}". Please check your Order ID or phone number.
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-stone-400">
              Enter an Order ID above to check live dispatch and delivery status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
