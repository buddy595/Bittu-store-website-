import React, { useState } from 'react';
import { 
  X, 
  Star, 
  CheckCircle2, 
  Shield, 
  Truck, 
  Compass, 
  Sparkles,
  ShoppingBag,
  CreditCard,
  Banknote
} from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/upi';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenSizeGuide: () => void;
  onOpenCart: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onOpenSizeGuide,
  onOpenCart
}) => {
  const { addToCart } = useStore();
  
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<string>(
    product.availableSizes ? product.availableSizes[0] : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [cadetName, setCadetName] = useState('');
  const [regimentalNumber, setRegimentalNumber] = useState('');
  const [unitBattalion, setUnitBattalion] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(
      product,
      selectedSize || undefined,
      quantity,
      cadetName ? cadetName.toUpperCase() : undefined,
      regimentalNumber ? regimentalNumber.toUpperCase() : undefined,
      unitBattalion ? unitBattalion.toUpperCase() : undefined
    );
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
      onOpenCart();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Image & Trust Column */}
          <div className="p-6 bg-stone-50 border-r border-stone-200 flex flex-col justify-between">
            <div>
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-stone-200 mb-4 shadow-inner">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-stone-950 font-black text-xs px-2.5 py-1 rounded-md shadow-xs">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Personalized Name Tag Live Preview (if customizable) */}
              {product.isCustomizable && cadetName && (
                <div className="mb-4 p-3 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 rounded-xl border border-amber-300 shadow-sm text-center">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block mb-0.5">
                    Brass Name Plate Live Engraving
                  </span>
                  <div className="bg-gradient-to-b from-amber-400 to-amber-600 p-2.5 rounded border border-amber-700 shadow-inner">
                    <p className="font-serif font-black text-sm tracking-widest text-stone-950 uppercase">
                      {cadetName || 'CADET NAME'}
                    </p>
                    {regimentalNumber && (
                      <p className="text-[10px] font-mono font-bold text-stone-900 tracking-wider">
                        {regimentalNumber}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Drill Regulation Note */}
            {product.drillRegulationNote && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-950 text-xs">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Dress Regulation Standard:</span>
                    <p className="text-red-900 text-[11px] mt-0.5">{product.drillRegulationNote}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Details & Customization Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-800 uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  {product.wing.toUpperCase()} WING • {product.category.replace('_', ' ').toUpperCase()}
                </span>
                <div className="flex items-center gap-1 text-xs text-stone-600 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-stone-400">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                  {product.name}
                </h2>
                <p className="text-stone-600 text-xs sm:text-sm mt-1">
                  {product.subtitle}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-stone-900">
                  {formatINR(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Direct Bank UPI &amp; COD Supported
                </span>
              </div>

              {/* Description */}
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                {product.description}
              </p>

              {/* Specifications / Features */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-stone-800">Inspection Grade Features:</span>
                <ul className="space-y-1">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-stone-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Size Selection */}
              {product.availableSizes && product.availableSizes.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-900">Select Parade Size:</span>
                    <button
                      onClick={onOpenSizeGuide}
                      className="text-xs text-red-800 hover:text-red-950 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      View Measurements
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          selectedSize === size
                            ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Customization: Cadet Name & ID */}
              {product.isCustomizable && (
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Free Cadet Personalization (Name Plate / Tags)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-0.5">
                        Cadet Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ROHAN SHARMA"
                        value={cadetName}
                        onChange={(e) => setCadetName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900 uppercase focus:outline-hidden focus:border-red-700"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-0.5">
                        Regimental No. (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. UP/24/SDA/112345"
                        value={regimentalNumber}
                        onChange={(e) => setRegimentalNumber(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs text-stone-900 uppercase focus:outline-hidden focus:border-red-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-bold text-stone-800">Quantity:</span>
                <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-stone-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-stone-600 hover:bg-stone-200 text-sm font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-stone-600 hover:bg-stone-200 text-sm font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-stone-200 space-y-2">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  addedSuccess
                    ? 'bg-emerald-600 text-white'
                    : !product.inStock
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-red-800 hover:bg-red-900 text-white shadow-red-900/20'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Added to Cadet Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Bag • {formatINR(product.price * quantity)}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-1">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                  Direct UPI / NetBanking
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-stone-400" />
                  Cash on Delivery
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-stone-400" />
                  Dispatched in 24h
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
