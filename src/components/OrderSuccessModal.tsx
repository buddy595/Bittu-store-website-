import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  Printer, 
  Truck, 
  MessageCircle, 
  Copy, 
  Check, 
  QrCode, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  X
} from 'lucide-react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { formatINR, buildUpiUri, generateQrDataUrl } from '../utils/upi';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenTrack: () => void;
  onPrintInvoice: (order: Order) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onOpenTrack,
  onPrintInvoice
}) => {
  const { settings, submitUtrProof } = useStore();
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [utrInput, setUtrInput] = useState(order?.utrNumber || '');
  const [utrSaved, setUtrSaved] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (order) {
      // Trigger festive confetti for successful order placement
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (order.paymentMethod === 'upi') {
        const upiUri = buildUpiUri({
          upiId: settings.upiId,
          payeeName: settings.accountHolderName || settings.storeName,
          amount: order.totalAmount,
          orderId: order.id
        });
        generateQrDataUrl(upiUri).then(url => setQrUrl(url));
      }
    }
  }, [order, settings]);

  if (!order) return null;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const handleSaveUtr = (e: React.FormEvent) => {
    e.preventDefault();
    if (utrInput.trim()) {
      submitUtrProof(order.id, utrInput.trim());
      setUtrSaved(true);
      setTimeout(() => setUtrSaved(false), 2500);
    }
  };

  // WhatsApp Alert Link for the seller/buyer
  const whatsappMessage = encodeURIComponent(
    `Jai Hind Sir! I have placed an NCC Uniform Order on your store.\n\n` +
    `*Order ID:* ${order.id}\n` +
    `*Cadet Name:* ${order.customer.fullName}\n` +
    `*Unit:* ${order.customer.battalionUnit}\n` +
    `*Wing:* ${order.customer.wing.toUpperCase()} WING\n` +
    `*Total Amount:* ₹${order.totalAmount}\n` +
    `*Payment Mode:* ${order.paymentMethod.toUpperCase()}\n` +
    (order.utrNumber || utrInput ? `*UTR / Ref No:* ${order.utrNumber || utrInput}\n` : '') +
    `\nPlease confirm and dispatch at earliest.`
  );

  const whatsappUrl = `https://wa.me/${settings.sellerWhatsAppNumber}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative bg-white rounded-3xl max-w-xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Banner Header */}
        <div className="p-6 bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white rounded-t-3xl text-center relative overflow-hidden">
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
            <CheckCircle className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest block mb-0.5">
            JAI HIND • ORDER CONFIRMED
          </span>
          <h2 className="text-xl sm:text-2xl font-black">
            Order Successfully Placed!
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-xs ${
              order.paymentMethod === 'cod' 
                ? 'bg-amber-400 text-stone-950' 
                : 'bg-emerald-500 text-white'
            }`}>
              {order.paymentMethod === 'cod' ? '💵 Cash on Delivery (COD)' : '⚡ Online Payment (Direct UPI)'}
            </span>
          </div>
          <p className="text-stone-300 text-xs mt-1.5">
            Uniform inspection preparation initiated for {order.customer.fullName}
          </p>
        </div>

        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Order ID & Copy */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Official Order Reference ID
              </span>
              <span className="text-base font-black font-mono text-stone-900">
                {order.id}
              </span>
            </div>
            <button
              onClick={handleCopyOrderId}
              className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedOrderId ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Payment Specific Instructions */}
          {order.paymentMethod === 'upi' && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Direct Bank UPI Payment Verification</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-emerald-100">
                {qrUrl && (
                  <img
                    src={qrUrl}
                    alt="Direct UPI QR"
                    className="w-28 h-28 rounded-lg shadow-xs shrink-0"
                  />
                )}
                <div className="text-xs text-stone-600 space-y-1">
                  <p>
                    Amount: <strong className="text-stone-900 font-bold">{formatINR(order.totalAmount)}</strong>
                  </p>
                  <p>
                    Seller UPI ID: <code className="font-mono font-bold text-stone-800">{settings.upiId}</code>
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    Funds credit directly into the seller's account with zero intermediary delay.
                  </p>
                </div>
              </div>

              {/* UTR Submission Form */}
              <form onSubmit={handleSaveUtr} className="pt-1">
                <label className="text-[11px] font-bold text-stone-800 block mb-1">
                  Enter 12-digit UPI UTR / Reference ID for instant dispatch approval:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 412891002341"
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono font-bold text-stone-900 focus:outline-hidden focus:border-emerald-700"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                  >
                    {utrSaved ? 'Submitted!' : 'Submit UTR'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {order.paymentMethod === 'cod' && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <Clock className="w-4 h-4 text-amber-700" />
                Cash on Delivery Scheduled:
              </span>
              <p>• Your package will be dispatched via India Post / Express Logistics within 24 hours.</p>
              <p>• Please keep exact cash of <strong>{formatINR(order.totalAmount)}</strong> ready at the time of delivery.</p>
            </div>
          )}

          {order.paymentMethod === 'bank_transfer' && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 space-y-1.5">
              <span className="font-bold">Direct IMPS / NEFT Transfer:</span>
              <p>
                Transfer <strong>{formatINR(order.totalAmount)}</strong> to Account: <strong className="font-mono">{settings.bankAccountNumber}</strong> (IFSC: <strong className="font-mono">{settings.bankIfscCode}</strong>).
              </p>
            </div>
          )}

          {/* Action Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* WhatsApp Notify Seller */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ping Seller on WhatsApp</span>
            </a>

            {/* Print Official Invoice */}
            <button
              onClick={() => onPrintInvoice(order)}
              className="p-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 border border-stone-300 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>Print Cadet Bill / Invoice</span>
            </button>
          </div>

          {/* Track order button */}
          <div className="pt-2 text-center">
            <button
              onClick={() => {
                onClose();
                onOpenTrack();
              }}
              className="text-xs font-bold text-red-800 hover:text-red-950 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Delivery Status</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
