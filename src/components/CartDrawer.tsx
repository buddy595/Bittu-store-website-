import React from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Sparkles,
  QrCode,
  Banknote
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/upi';
import { PaymentMethod } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: (preferredPayment?: PaymentMethod) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout
}) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, getCartTotal, settings } = useStore();
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentMethod>('upi');

  if (!isOpen) return null;

  const { subtotal, shipping, total, totalCount } = getCartTotal();
  const freeShippingThreshold = settings.minOrderForFreeShipping;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-100 text-red-800">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-stone-900 text-base">
                  Cadet Shopping Bag
                </h2>
                <p className="text-xs text-stone-500">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'} in your kit
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-5 py-3 bg-stone-100/70 border-b border-stone-200">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-stone-700 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-stone-500" />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-bold">You qualify for FREE Delivery!</span>
                ) : (
                  <span>Add {formatINR(amountNeededForFreeShipping)} more for FREE Delivery</span>
                )}
              </span>
              <span className="font-bold text-stone-600">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-stone-100 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-stone-800 text-base">Your kit bag is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs">
                  Browse our DG NCC approved uniform sets, DMS boots, woolen berets, or assemble a complete kit.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs cursor-pointer hover:bg-stone-800"
                >
                  Explore Uniform Catalog
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="pt-4 first:pt-0 flex gap-3">
                  {/* Thumbnail */}
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-18 h-18 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                  />

                  {/* Item Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-stone-900 text-xs line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Selected Size */}
                      {item.selectedSize && (
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Size: <strong className="text-stone-700">{item.selectedSize}</strong>
                        </p>
                      )}

                      {/* Customization Details if any */}
                      {(item.cadetName || item.regimentalNumber) && (
                        <div className="mt-1 p-1.5 bg-amber-50 rounded border border-amber-200 text-[10px] text-amber-900 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate">
                            Tag: <strong>{item.cadetName}</strong> {item.regimentalNumber ? `(${item.regimentalNumber})` : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quantity & Item Subtotal */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                        <button
                          onClick={() => updateCartQuantity(index, item.quantity - 1)}
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-200 font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(index, item.quantity + 1)}
                          className="px-2 py-0.5 text-stone-600 hover:bg-stone-200 font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-black text-stone-900 text-xs sm:text-sm">
                        {formatINR(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Checkout Actions */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-stone-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Charges:</span>
                  <span className="font-semibold text-stone-900">
                    {shipping === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      formatINR(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-stone-900 pt-1.5 border-t border-stone-200">
                  <span>Total Payable:</span>
                  <span className="text-base text-red-800">{formatINR(total)}</span>
                </div>
              </div>

              {/* Interactive Customer Payment Mode Choice */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">Select Payment Option:</span>
                  <span className="text-[10px] text-stone-500 font-medium">Changeable at checkout</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPayment('upi')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedPayment === 'upi'
                        ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/30 text-emerald-950 shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold text-xs text-emerald-900">
                        <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                        Pay Online
                      </span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        selectedPayment === 'upi' ? 'border-emerald-600 bg-emerald-600 text-white text-[8px] font-bold' : 'border-stone-300'
                      }`}>
                        {selectedPayment === 'upi' && '✓'}
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-1 font-medium">UPI / GPay / NetBanking</p>
                    <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100/70 px-1 py-0.2 rounded mt-1 inline-block">
                      0% Fee • Instant
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPayment('cod')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedPayment === 'cod'
                        ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-600/30 text-amber-950 shadow-2xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-bold text-xs text-amber-900">
                        <Banknote className="w-3.5 h-3.5 text-amber-600" />
                        Cash on Delivery
                      </span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        selectedPayment === 'cod' ? 'border-amber-600 bg-amber-600 text-white text-[8px] font-bold' : 'border-stone-300'
                      }`}>
                        {selectedPayment === 'cod' && '✓'}
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-800 mt-1 font-medium">Pay Cash at Doorstep</p>
                    <span className="text-[9px] text-amber-900 font-bold bg-amber-100/70 px-1 py-0.2 rounded mt-1 inline-block">
                      Doorstep Verification
                    </span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout(selectedPayment);
                }}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  selectedPayment === 'cod'
                    ? 'bg-amber-700 hover:bg-amber-800 text-white shadow-amber-900/20'
                    : 'bg-red-800 hover:bg-red-900 text-white shadow-red-900/20'
                }`}
              >
                <span>
                  {selectedPayment === 'cod' 
                    ? `Proceed with Cash on Delivery (${formatINR(total)})` 
                    : `Proceed with Online Payment (${formatINR(total)})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={clearCart}
                className="w-full text-center text-xs text-stone-400 hover:text-stone-600 cursor-pointer pt-1"
              >
                Clear Kit Bag
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
