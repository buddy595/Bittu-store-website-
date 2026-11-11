import React from 'react';
import { X, ShieldCheck, Check, Sparkles, ChevronRight } from 'lucide-react';
import { WingType, Product } from '../types';

interface WingsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWing: WingType;
  onSelectWing: (wing: WingType) => void;
  products: Product[];
}

export const WingsBottomSheet: React.FC<WingsBottomSheetProps> = ({
  isOpen,
  onClose,
  selectedWing,
  onSelectWing,
  products
}) => {
  if (!isOpen) return null;

  const wings: {
    id: WingType;
    title: string;
    subtitle: string;
    badgeColor: string;
    tag: string;
    borderActive: string;
  }[] = [
    {
      id: 'all',
      title: 'All Categories & Wings',
      subtitle: 'Complete catalog of uniforms, boots, berets & badges',
      badgeColor: 'bg-stone-800 text-stone-100',
      tag: 'ALL',
      borderActive: 'border-stone-900 bg-stone-50'
    },
    {
      id: 'army',
      title: 'Army Wing (SD & JD)',
      subtitle: 'Official Khaki Drill sets, Rifle Green Beret & Red Hackle',
      badgeColor: 'bg-red-800 text-white',
      tag: 'ARMY',
      borderActive: 'border-red-700 bg-red-50/50'
    },
    {
      id: 'navy',
      title: 'Navy Wing (Naval Cadets)',
      subtitle: 'Pristine White Drill sets, Navy Beret & Royal Blue Hackle',
      badgeColor: 'bg-blue-900 text-amber-300',
      tag: 'NAVY',
      borderActive: 'border-blue-800 bg-blue-50/50'
    },
    {
      id: 'air',
      title: 'Air Wing (Aero Cadets)',
      subtitle: 'Sky Blue Shirts, Navy Blue Trousers & Air Force Blue Beret',
      badgeColor: 'bg-sky-600 text-white',
      tag: 'AIR',
      borderActive: 'border-sky-600 bg-sky-50/50'
    },
    {
      id: 'common',
      title: 'Boots & Drill Accessories',
      subtitle: 'High-Ankle DMS Boots, Horseshoe Taps, Brass Name Plates & Belts',
      badgeColor: 'bg-emerald-800 text-white',
      tag: 'GEAR',
      borderActive: 'border-emerald-700 bg-emerald-50/50'
    }
  ];

  const getCount = (wingId: WingType) => {
    if (wingId === 'all') return products.length;
    return products.filter(p => p.wing === wingId || (wingId !== 'common' && p.wing === 'common')).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-up Bottom Sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden z-10 border-t border-stone-200 animate-in slide-in-from-bottom-6 duration-200 max-h-[85vh] flex flex-col">
        {/* Handle bar */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-stone-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
              <span>Select Uniform Wing</span>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                DG NCC
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Filter by Cadet Division specification
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wing List */}
        <div className="p-4 overflow-y-auto space-y-2.5">
          {wings.map(wing => {
            const count = getCount(wing.id);
            const isSelected = selectedWing === wing.id;

            return (
              <button
                key={wing.id}
                onClick={() => {
                  onSelectWing(wing.id);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected 
                    ? `${wing.borderActive} shadow-xs ring-1 ring-stone-900/10` 
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${wing.badgeColor} flex items-center justify-center font-black text-xs shrink-0 shadow-xs`}>
                    {wing.tag}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                        {wing.title}
                      </h4>
                      <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded-full">
                        {count} items
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                      {wing.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pl-2">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-red-700 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-50 border-t border-stone-100 text-center text-[11px] text-stone-500">
          Direct bank transfer (UPI) and Cash on Delivery available for all wings.
        </div>
      </div>
    </div>
  );
};
