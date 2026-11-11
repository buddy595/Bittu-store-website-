import React from 'react';
import { X, Printer, Shield, CheckCircle2 } from 'lucide-react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/upi';

interface InvoicePrintProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoicePrint: React.FC<InvoicePrintProps> = ({ order, onClose }) => {
  const { settings } = useStore();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto no-print-overlay">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Header (Hidden in Print) */}
        <div className="no-print p-4 bg-stone-900 text-white flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Printer className="w-4 h-4" />
            <span>OFFICIAL CADET DISPATCH INVOICE &amp; PACKING SLIP</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-red-700 hover:bg-red-600 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-6 sm:p-10 text-stone-900 bg-white">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-stone-900 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-800 text-white font-black text-xs px-2 py-0.5 rounded">
                  NCC
                </span>
                <h1 className="font-black text-lg sm:text-xl tracking-tight text-stone-950 uppercase">
                  {settings.storeName}
                </h1>
              </div>
              <p className="text-xs text-stone-600 font-semibold mt-1">
                Authorized Supplier of DG NCC Regulation Uniforms, Boots &amp; Badges
              </p>
              <p className="text-[11px] text-stone-500">
                Helpline: {settings.supportPhone} | Email: {settings.supportEmail}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block">
                TAX INVOICE / DISPATCH SLIP
              </span>
              <span className="font-mono font-black text-sm text-stone-900">
                INV-{order.id}
              </span>
              <p className="text-xs text-stone-500 mt-0.5">
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Billed To / Cadet Details */}
          <div className="grid grid-cols-2 gap-6 py-5 border-b border-stone-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Billed &amp; Shipped To Cadet:
              </span>
              <p className="font-bold text-stone-900 text-sm">
                {order.customer.fullName}
              </p>
              <p className="text-stone-700 font-semibold">
                Unit: {order.customer.battalionUnit} ({order.customer.wing.toUpperCase()} WING)
              </p>
              {order.customer.cadetNumber && (
                <p className="text-stone-600 font-mono">
                  Regimental No: {order.customer.cadetNumber}
                </p>
              )}
              <p className="text-stone-600 mt-1">
                {order.customer.addressLine}, {order.customer.city}, {order.customer.state} - {order.customer.pincode}
              </p>
              <p className="text-stone-600">
                Mobile: +91 {order.customer.phone}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Payment &amp; Settlement Info:
              </span>
              <p className="font-semibold text-stone-900">
                Mode: {order.paymentMethod === 'upi' ? 'Direct Bank UPI (Instant)' : order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Direct Bank IMPS'}
              </p>
              <p className="text-stone-600">
                Status: <strong className="uppercase text-emerald-800">{order.paymentStatus}</strong>
              </p>
              {order.utrNumber && (
                <p className="font-mono text-stone-700">
                  Bank UTR / Ref: {order.utrNumber}
                </p>
              )}
              <p className="text-[11px] text-stone-500 mt-1">
                Direct Seller Account: {settings.accountHolderName}
              </p>
            </div>
          </div>

          {/* Table of Items */}
          <div className="py-4">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-stone-800 text-[10px] uppercase font-bold text-stone-600">
                  <th className="py-2">Item Description</th>
                  <th className="py-2">Size / Spec</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-medium text-stone-900">
                      <div>{item.product.name}</div>
                      {(item.cadetName || item.regimentalNumber) && (
                        <div className="text-[10px] text-amber-900 font-semibold">
                          Custom Tag: {item.cadetName} {item.regimentalNumber ? `(${item.regimentalNumber})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-stone-600">{item.selectedSize || 'Standard'}</td>
                    <td className="py-3 text-center font-bold text-stone-800">{item.quantity}</td>
                    <td className="py-3 text-right text-stone-600">{formatINR(item.product.price)}</td>
                    <td className="py-3 text-right font-bold text-stone-900">
                      {formatINR(item.product.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-stone-800 pt-3 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Charges:</span>
                <span>{order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}</span>
              </div>
              {order.codFee > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>COD Handling Fee:</span>
                  <span>{formatINR(order.codFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>Grand Total:</span>
                <span className="text-base text-red-800">{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer & Inspection Seal */}
          <div className="mt-10 pt-6 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <div className="space-y-1 max-w-sm">
              <p className="font-bold text-stone-800">Inspection &amp; Exchange Policy:</p>
              <p className="text-[10px]">
                Goods supplied conform to DG NCC Dress Regulations. Free size exchange supported within 7 days of delivery.
              </p>
              <p className="text-[10px] font-bold text-stone-700">
                "Ekta aur Anushasan" • Unity and Discipline
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-14 border border-dashed border-stone-300 rounded flex items-center justify-center text-[10px] text-stone-400 mb-1">
                Authorized Signatory
              </div>
              <span className="text-[10px] font-bold text-stone-800">
                {settings.ownerName}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
