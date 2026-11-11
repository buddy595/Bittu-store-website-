import React from 'react';
import { 
  Sparkles, 
  Banknote, 
  QrCode, 
  Truck, 
  Award,
  ChevronRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { WingType } from '../types';
import { useStore } from '../context/StoreContext';

interface HeroBannerProps {
  onSelectWing: (wing: WingType) => void;
  onOpenKitBuilder: () => void;
  onOpenSizeGuide: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectWing,
  onOpenKitBuilder,
  onOpenSizeGuide
}) => {
  const { settings } = useStore();
  const banners = settings.banners || {
    heroBadge: "National Cadet Corps Authorized Specification",
    heroTitle: "Official Uniforms, DMS Boots & Drill Gear for Cadets",
    heroSubtitle: "Equip yourself for CATC, ATC camps, and Republic Day Parade selections. Authentic drill-weight fabrics, iron-heel DMS boots, woolen berets, brass crests, and custom-engraved nameplates.",
    heroCtaText: "Build All-In-One Cadet Kit (Save ₹700)"
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white border-b border-stone-800">
      {/* Background Military Camo Subtle Mesh */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      {/* Decorative Tri-color Gradient Glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-700/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          {/* Main Hero Content - Reads directly from Admin-editable settings */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800/90 border border-stone-700/80 text-amber-400 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{banners.heroBadge}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              {banners.heroTitle}
            </h1>

            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              {banners.heroSubtitle}
            </p>

            {/* Payment & Trust Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-stone-800/80 border border-stone-700/70 rounded-xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-700/40 text-emerald-400 shrink-0">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs font-bold text-stone-100">Direct Bank / UPI</h4>
                  <p className="text-[10px] text-stone-400 hidden sm:block">0% gateway fee</p>
                </div>
              </div>

              <div className="bg-stone-800/80 border border-stone-700/70 rounded-lg sm:rounded-xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2">
                <div className="p-1.5 rounded-lg bg-amber-950 border border-amber-700/40 text-amber-400 shrink-0">
                  <Banknote className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs font-bold text-stone-100">Cash on Delivery</h4>
                  <p className="text-[10px] text-stone-400 hidden sm:block">Doorstep payment</p>
                </div>
              </div>

              <div className="bg-stone-800/80 border border-stone-700/70 rounded-lg sm:rounded-xl p-2 sm:p-2.5 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1 sm:gap-2">
                <div className="p-1.5 rounded-lg bg-blue-950 border border-blue-700/40 text-blue-400 shrink-0">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11px] sm:text-xs font-bold text-stone-100">Speed Post</h4>
                  <p className="text-[10px] text-stone-400 hidden sm:block">Camp dispatch</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2 pt-1 flex-wrap sm:flex-nowrap">
              <button
                onClick={onOpenKitBuilder}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-current text-stone-900" />
                <span>{banners.heroCtaText}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenSizeGuide}
                className="py-2.5 px-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs active:scale-98 transition-colors cursor-pointer whitespace-nowrap"
              >
                Inspection Size Guide
              </button>
            </div>
          </div>

          {/* Quick 3-Wing Selector Cards */}
          <div className="lg:col-span-5 grid grid-cols-3 lg:grid-cols-1 gap-2.5 sm:gap-3">
            
            {/* Army Wing */}
            <div 
              onClick={() => onSelectWing('army')}
              className="group cursor-pointer bg-gradient-to-r from-red-950/80 to-stone-900 border border-red-800/40 hover:border-red-600 rounded-xl p-2.5 sm:p-3.5 transition-all hover:translate-x-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-800 flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0">
                    ARM
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-stone-100 group-hover:text-red-400 transition-colors">
                      Army Wing (SD &amp; JD)
                    </h3>
                    <p className="text-[10px] sm:text-xs text-stone-400 line-clamp-1">
                      Standard Khaki Uniform &amp; Beret
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-red-400 transition-colors shrink-0" />
              </div>
            </div>

            {/* Navy Wing */}
            <div 
              onClick={() => onSelectWing('navy')}
              className="group cursor-pointer bg-gradient-to-r from-blue-950/80 to-stone-900 border border-blue-800/40 hover:border-blue-500 rounded-xl p-2.5 sm:p-3.5 transition-all hover:translate-x-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-900 flex items-center justify-center text-amber-300 font-black text-xs shadow-xs shrink-0">
                    NAV
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-stone-100 group-hover:text-blue-300 transition-colors">
                      Navy Wing (Naval Cadets)
                    </h3>
                    <p className="text-[10px] sm:text-xs text-stone-400 line-clamp-1">
                      Pristine White Uniform &amp; Hackle
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-blue-300 transition-colors shrink-0" />
              </div>
            </div>

            {/* Air Wing */}
            <div 
              onClick={() => onSelectWing('air')}
              className="group cursor-pointer bg-gradient-to-r from-sky-950/80 to-stone-900 border border-sky-800/40 hover:border-sky-400 rounded-xl p-2.5 sm:p-3.5 transition-all hover:translate-x-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0">
                    AIR
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-stone-100 group-hover:text-sky-300 transition-colors">
                      Air Wing (Aero Cadets)
                    </h3>
                    <p className="text-[10px] sm:text-xs text-stone-400 line-clamp-1">
                      Sky Blue Shirt &amp; Navy Trousers
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-sky-300 transition-colors shrink-0" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
