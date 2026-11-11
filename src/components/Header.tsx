import React from 'react';
import { 
  ShoppingBag, 
  Search, 
  Truck, 
  ShieldCheck, 
  SlidersHorizontal,
  Compass,
  Sparkles,
  PhoneCall,
  UserCheck,
  User,
  Phone
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { WingType } from '../types';

interface HeaderProps {
  selectedWing: WingType;
  onSelectWing: (wing: WingType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCart: () => void;
  onOpenTrack: () => void;
  onOpenKitBuilder: () => void;
  onOpenSizeGuide: () => void;
  onOpenVerification: () => void;
  onOpenCustomer: () => void;
  onOpenAdminLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedWing,
  onSelectWing,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenTrack,
  onOpenKitBuilder,
  onOpenSizeGuide,
  onOpenVerification,
  onOpenCustomer,
  onOpenAdminLogin
}) => {
  const { cart, activeView, setActiveView, settings, verifiedCustomer } = useStore();
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      
      {/* Top Military Notice Bar */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white text-[11px] py-1.5 px-3 sm:px-6 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
            <span className="font-bold text-amber-300 text-[10px] sm:text-xs whitespace-nowrap">
              <span className="sm:hidden">DG NCC Approved</span>
              <span className="hidden sm:inline">DG NCC Regulation Approved</span>
            </span>
            <span className="hidden md:inline text-stone-400 text-[11px]">• Direct Bank Transfer (0% Fee) &amp; Cash on Delivery</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenSizeGuide}
              className="hidden sm:flex items-center gap-1 text-stone-300 hover:text-amber-300 transition-colors text-[11px] cursor-pointer"
            >
              <Compass className="w-3 h-3 text-amber-400" />
              <span>Inspection Sizing</span>
            </button>
            <span className="hidden sm:inline text-stone-700">|</span>
            <a 
              href={`tel:${settings.supportPhone}`}
              className="flex items-center gap-1.5 text-stone-200 hover:text-white transition-colors font-bold text-[10px] sm:text-[11px] bg-stone-800/90 hover:bg-stone-800 px-2 sm:px-2.5 py-0.5 rounded-full border border-stone-700 shadow-2xs whitespace-nowrap"
              title="Call Customer Helpline"
            >
              <PhoneCall className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
              <span className="hidden lg:inline text-stone-400">24x7 Helpline:</span>
              <span className="font-mono text-white">{settings.supportPhone}</span>
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[8px] font-black shrink-0" title="Verified Store Helpline">
                ✓
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo - Authentic NCC Cadet Outfitters */}
          <button 
            onClick={() => setActiveView('store')}
            className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer shrink min-w-0"
          >
            {/* NCC Tri-color Badge Emblem */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex flex-col shadow-xs border border-stone-300 group-hover:scale-105 transition-transform shrink-0">
              <div className="h-1/3 bg-red-700 flex items-center justify-center">
                <span className="text-[7px] font-black text-white tracking-tighter">ARMY</span>
              </div>
              <div className="h-1/3 bg-blue-900 flex items-center justify-center">
                <span className="text-[7px] font-black text-amber-300 tracking-tighter">NAVY</span>
              </div>
              <div className="h-1/3 bg-sky-500 flex items-center justify-center">
                <span className="text-[7px] font-black text-white tracking-tighter">AIR</span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-stone-900 text-sm sm:text-base md:text-lg tracking-tight uppercase truncate">
                  Cadet Uniforms
                </span>
                <span className="bg-red-800 text-white font-bold text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded tracking-wide shrink-0">
                  NCC
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-stone-500 tracking-wider truncate hidden xs:block">
                <span className="sm:hidden">UNITY &amp; DISCIPLINE</span>
                <span className="hidden sm:inline">EKTA AUR ANUSHASAN • UNITY &amp; DISCIPLINE</span>
              </p>
            </div>
          </button>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Army khaki, Navy white, DMS boots, beret, badges..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-stone-100 hover:bg-stone-50 focus:bg-white border border-stone-200 focus:border-red-700 rounded-full text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden transition-all shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Original Color Number Verified Sign (Engineered to Fit Mobile, Tablet, Laptop, and PC Screens) */}
            <button
              onClick={onOpenCustomer}
              className={`flex items-center gap-1.5 px-2 sm:px-2.5 lg:px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border shrink-0 ${
                verifiedCustomer
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300 shadow-2xs'
              }`}
              title={verifiedCustomer ? "Mobile Number Verified" : "Verify Mobile Number with OTP"}
            >
              {verifiedCustomer ? (
                <>
                  {/* Original Emerald Verified Badge Icon */}
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs">
                    ✓
                  </div>
                  
                  {/* Mobile Screen: Compact Number (< 640px) */}
                  <span className="font-mono text-[11px] font-bold text-emerald-900 sm:hidden whitespace-nowrap">
                    +91 ••{verifiedCustomer.phone.slice(-4)}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse sm:hidden shrink-0"></span>

                  {/* Tablet Screen: Full Number (640px - 1024px) */}
                  <span className="hidden sm:inline lg:hidden font-mono text-xs font-bold text-emerald-950 whitespace-nowrap">
                    +91 {verifiedCustomer.phone.slice(0, 5)} {verifiedCustomer.phone.slice(5)}
                  </span>
                  <span className="hidden sm:inline-flex lg:hidden bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs uppercase tracking-tight">
                    Verified
                  </span>

                  {/* Desktop / PC Screen: Full Number + Verified Cadet Badge (> 1024px) */}
                  <span className="hidden lg:inline font-mono text-xs font-extrabold text-emerald-950 whitespace-nowrap">
                    +91 {verifiedCustomer.phone.slice(0, 5)} {verifiedCustomer.phone.slice(5)}
                  </span>
                  <span className="hidden lg:inline-flex bg-emerald-700 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs uppercase tracking-wide">
                    Verified Cadet
                  </span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center shrink-0">
                    <User className="w-2.5 h-2.5 text-red-700" />
                  </div>
                  {/* Mobile Screen */}
                  <span className="text-[11px] font-bold text-stone-700 sm:hidden whitespace-nowrap">
                    Verify
                  </span>
                  {/* Tablet Screen */}
                  <span className="hidden sm:inline lg:hidden text-xs font-bold text-stone-700 whitespace-nowrap">
                    Verify Mobile OTP
                  </span>
                  {/* Desktop Screen */}
                  <span className="hidden lg:inline text-xs font-bold text-stone-700 whitespace-nowrap">
                    Verify Mobile Number
                  </span>
                </>
              )}
            </button>

            {/* Shopping Bag Button with Red & Amber Accent */}
            <button
              onClick={onOpenCart}
              className="relative p-2 sm:p-2.5 rounded-xl bg-red-800 hover:bg-red-900 text-white shadow-xs transition-colors cursor-pointer shrink-0"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-stone-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>

          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Army khaki, Navy white, DMS boots, beret..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-stone-100 hover:bg-stone-50 focus:bg-white border border-stone-200 focus:border-red-700 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden transition-all shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs p-0.5 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Wing Filter Sub-bar */}
      {activeView === 'store' && (
        <div className="bg-stone-100/90 border-t border-stone-200 px-3 sm:px-6 py-2 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Select Wing:
            </span>

            <button
              onClick={() => onSelectWing('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedWing === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-200 hover:text-stone-900 border border-stone-200'
              }`}
            >
              All Categories
            </button>

            <button
              onClick={() => onSelectWing('army')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedWing === 'army'
                  ? 'bg-red-800 text-white shadow-xs ring-1 ring-red-900'
                  : 'bg-white text-red-900 hover:bg-red-50 border border-red-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Army Wing (Khaki)
            </button>

            <button
              onClick={() => onSelectWing('navy')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedWing === 'navy'
                  ? 'bg-blue-900 text-white shadow-xs ring-1 ring-blue-950'
                  : 'bg-white text-blue-900 hover:bg-blue-50 border border-blue-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Navy Wing (White)
            </button>

            <button
              onClick={() => onSelectWing('air')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedWing === 'air'
                  ? 'bg-sky-600 text-white shadow-xs ring-1 ring-sky-700'
                  : 'bg-white text-sky-900 hover:bg-sky-50 border border-sky-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Air Wing (Sky Blue)
            </button>

            <button
              onClick={() => onSelectWing('common')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedWing === 'common'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Drill Accessories &amp; Boots
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
