import React from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  User, 
  SlidersHorizontal,
  Home
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { WingType } from '../types';

interface MobileBottomNavProps {
  onOpenCart: () => void;
  onOpenKitBuilder: () => void;
  onOpenWingsSheet: () => void;
  onOpenCustomer: () => void;
  selectedWing: WingType;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenCart,
  onOpenKitBuilder,
  onOpenWingsSheet,
  onOpenCustomer,
  selectedWing
}) => {
  const { cart, activeView, setActiveView, verifiedCustomer } = useStore();
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-xl px-2 py-1.5 max-w-md mx-auto">
      <div className="flex items-center justify-around">
        
        {/* 1. Home / Storefront */}
        <button
          onClick={() => {
            setActiveView('store');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeView === 'store'
              ? 'text-red-800 font-extrabold'
              : 'text-stone-500 hover:text-stone-900 font-medium'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* 2. Categories (Wings & Accessories) */}
        <button
          onClick={onOpenWingsSheet}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            selectedWing !== 'all'
              ? 'text-red-800 font-extrabold'
              : 'text-stone-500 hover:text-stone-900 font-medium'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">
            {selectedWing === 'all' ? 'Categories' : selectedWing.toUpperCase()}
          </span>
        </button>

        {/* 3. Parade Kit Center Star Feature */}
        <button
          onClick={onOpenKitBuilder}
          className="flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer text-amber-700 hover:text-amber-800 font-bold group"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-stone-950 flex items-center justify-center shadow-md -mt-4 border-2 border-white group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-black text-amber-900">
            Parade Kit
          </span>
        </button>

        {/* 4. Customer Section */}
        <button
          onClick={onOpenCustomer}
          className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer text-stone-600 hover:text-red-800 font-medium"
        >
          <div className="relative">
            <User className="w-5 h-5 mb-0.5" />
            {verifiedCustomer && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
            )}
          </div>
          <span className="text-[10px] tracking-tight font-semibold">
            Customer
          </span>
        </button>

        {/* 5. Cart / Bag */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer text-stone-600 hover:text-red-800 font-medium"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-700 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Cart</span>
        </button>

      </div>
    </nav>
  );
};
