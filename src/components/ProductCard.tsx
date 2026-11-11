import React, { useState } from 'react';
import { Star, Plus, Check, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/upi';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>(
    product.availableSizes ? product.availableSizes[0] : ''
  );
  const [justAdded, setJustAdded] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedSize || undefined, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const getWingBadge = () => {
    switch (product.wing) {
      case 'army':
        return <span className="bg-red-800 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow-xs">Army Wing</span>;
      case 'navy':
        return <span className="bg-blue-900 text-amber-300 font-bold text-[9px] px-1.5 py-0.5 rounded shadow-xs">Navy Wing</span>;
      case 'air':
        return <span className="bg-sky-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow-xs">Air Wing</span>;
      default:
        return <span className="bg-stone-800 text-stone-200 font-bold text-[9px] px-1.5 py-0.5 rounded shadow-xs">Cadet Gear</span>;
    }
  };

  return (
    <div 
      onClick={() => onOpenDetails(product)}
      className="group bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 hover:border-red-700/50 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer select-none"
    >
      {/* Product Image Section */}
      <div className="relative aspect-square bg-stone-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start z-10">
          {getWingBadge()}
          {discountPercent > 0 && (
            <span className="bg-amber-500 text-stone-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Customizable tag */}
        {product.isCustomizable && (
          <div className="absolute bottom-1.5 left-1.5 bg-stone-900/85 backdrop-blur-xs text-amber-300 font-semibold text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1 z-10">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>Brass Engraved</span>
          </div>
        )}

        {/* Stock status indicator */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="bg-red-700 text-white font-bold text-[10px] sm:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info Section */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 text-stone-500 text-[10px] mb-0.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="font-bold text-stone-800 text-[10px]">{product.rating}</span>
            <span className="text-[10px] text-stone-400">({product.reviewsCount} cadets)</span>
          </div>

          <h3 className="font-bold text-stone-900 text-xs sm:text-sm group-hover:text-red-700 transition-colors line-clamp-2 leading-tight">
            {product.name}
          </h3>

          <p className="text-stone-500 text-[10px] sm:text-xs line-clamp-1 mt-0.5">
            {product.subtitle}
          </p>
        </div>

        {/* Size Badge Preview */}
        {product.availableSizes && product.availableSizes.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[10px] text-stone-400 font-medium">Sizes:</span>
            {product.availableSizes.slice(0, 3).map((s) => (
              <span key={s} className="text-[9px] bg-stone-100 text-stone-600 px-1 py-0.2 rounded border border-stone-200">
                {s.split(' ')[0]}
              </span>
            ))}
            {product.availableSizes.length > 3 && (
              <span className="text-[9px] text-stone-400">+{product.availableSizes.length - 3}</span>
            )}
          </div>
        )}

        {/* Price & Action */}
        <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between gap-1">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-sm md:text-base font-black text-stone-900">
                {formatINR(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[9px] sm:text-[10px] text-stone-400 line-through">
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[9px] text-emerald-700 font-medium block">
              Direct Bank / COD
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : !product.inStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-red-700 hover:bg-red-800 text-white hover:shadow-xs active:scale-95'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3 h-3" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
