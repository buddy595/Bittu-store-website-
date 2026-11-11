import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Shield, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/upi';
import { WingType } from '../types';

interface KitBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart: () => void;
}

export const KitBuilderModal: React.FC<KitBuilderModalProps> = ({ isOpen, onClose, onOpenCart }) => {
  const { products, addToCart } = useStore();

  const [selectedWing, setSelectedWing] = useState<'army' | 'navy' | 'air'>('army');
  const [uniformSize, setUniformSize] = useState('38 (M)');
  const [bootSize, setBootSize] = useState('UK 8');
  const [beretSize, setBeretSize] = useState('7.0 inch (Medium)');
  const [cadetName, setCadetName] = useState('');
  const [regimentalNumber, setRegimentalNumber] = useState('');
  const [battalion, setBattalion] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Bundle pricing
  const regularPrice = 3199;
  const bundlePrice = 2499;
  const savings = regularPrice - bundlePrice;

  const handleAddKitToCart = () => {
    // Find the base kit or primary uniform product
    const kitProduct = products.find(p => p.id === 'ncc-kit-army-complete') || products[0];

    addToCart(
      {
        ...kitProduct,
        name: `All-In-One Complete ${selectedWing.toUpperCase()} Wing Cadet Parade Kit`,
        wing: selectedWing,
        price: bundlePrice,
        originalPrice: regularPrice
      },
      `Uniform: ${uniformSize} | Boots: ${bootSize} | Beret: ${beretSize}`,
      1,
      cadetName ? cadetName.toUpperCase() : 'CADET',
      regimentalNumber ? regimentalNumber.toUpperCase() : undefined,
      battalion ? battalion.toUpperCase() : undefined
    );

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      onOpenCart();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200"
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
        <div className="bg-gradient-to-r from-stone-900 via-red-950 to-stone-900 text-white p-6 sm:p-8 rounded-t-3xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs mb-3 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Turnkey Cadet Bundle • Save ₹{savings}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Build Your Complete NCC Parade Kit
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">
            Get fully equipped for Republic Day Camp, ATC/CATC camps, and daily college drill inspections in one customized order.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Step 1: Choose Wing */}
          <div>
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
              1. Choose Your Wing
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedWing('army')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedWing === 'army'
                    ? 'border-red-800 bg-red-50 text-red-950 ring-2 ring-red-700 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs">Army Wing</span>
                  {selectedWing === 'army' && <Check className="w-4 h-4 text-red-700" />}
                </div>
                <p className="text-[11px] text-stone-500">Khaki Dress &amp; Red Hackle</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedWing('navy')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedWing === 'navy'
                    ? 'border-blue-900 bg-blue-50 text-blue-950 ring-2 ring-blue-900 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs">Navy Wing</span>
                  {selectedWing === 'navy' && <Check className="w-4 h-4 text-blue-900" />}
                </div>
                <p className="text-[11px] text-stone-500">White Dress &amp; Blue Hackle</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedWing('air')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedWing === 'air'
                    ? 'border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-600 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs">Air Wing</span>
                  {selectedWing === 'air' && <Check className="w-4 h-4 text-sky-600" />}
                </div>
                <p className="text-[11px] text-stone-500">Sky Blue &amp; Navy Blue</p>
              </button>
            </div>
          </div>

          {/* Step 2: Sizing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
            {/* Uniform Size */}
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Uniform Chest Size
              </label>
              <select
                value={uniformSize}
                onChange={(e) => setUniformSize(e.target.value)}
                className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:outline-hidden focus:border-stone-800"
              >
                <option value="34 (XS)">34 (Chest 34" / Waist 28")</option>
                <option value="36 (S)">36 (Chest 36" / Waist 30")</option>
                <option value="38 (M)">38 (Chest 38" / Waist 32")</option>
                <option value="40 (L)">40 (Chest 40" / Waist 34")</option>
                <option value="42 (XL)">42 (Chest 42" / Waist 36")</option>
                <option value="44 (XXL)">44 (Chest 44" / Waist 38")</option>
              </select>
            </div>

            {/* DMS Boot Size */}
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                DMS Boots (India / UK)
              </label>
              <select
                value={bootSize}
                onChange={(e) => setBootSize(e.target.value)}
                className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:outline-hidden focus:border-stone-800"
              >
                <option value="UK 5">UK 5 (Foot 24.5 cm)</option>
                <option value="UK 6">UK 6 (Foot 25.3 cm)</option>
                <option value="UK 7">UK 7 (Foot 26.0 cm)</option>
                <option value="UK 8">UK 8 (Foot 26.8 cm)</option>
                <option value="UK 9">UK 9 (Foot 27.5 cm)</option>
                <option value="UK 10">UK 10 (Foot 28.3 cm)</option>
                <option value="UK 11">UK 11 (Foot 29.0 cm)</option>
              </select>
            </div>

            {/* Beret Size */}
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                Woolen Beret Size
              </label>
              <select
                value={beretSize}
                onChange={(e) => setBeretSize(e.target.value)}
                className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:outline-hidden focus:border-stone-800"
              >
                <option value="6.75 inch (Small)">6.75 inch (Small - 54 cm)</option>
                <option value="7.0 inch (Medium)">7.0 inch (Standard - 56 cm)</option>
                <option value="7.25 inch (Large)">7.25 inch (Large - 58 cm)</option>
                <option value="7.5 inch (XL)">7.5 inch (XL - 60 cm)</option>
              </select>
            </div>
          </div>

          {/* Step 3: Personalized Name Tag Engraving */}
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Included Free: Custom Brass Name Plate &amp; Unit Tag
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                Mirror Brass Finish
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-0.5">
                  Cadet Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. AMIT KUMAR"
                  value={cadetName}
                  onChange={(e) => setCadetName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 uppercase font-medium focus:outline-hidden focus:border-red-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-0.5">
                  Regimental Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DL/24/SDA/1004"
                  value={regimentalNumber}
                  onChange={(e) => setRegimentalNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 uppercase font-medium focus:outline-hidden focus:border-red-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-0.5">
                  Battalion / Unit
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7 DELHI BN NCC"
                  value={battalion}
                  onChange={(e) => setBattalion(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 uppercase font-medium focus:outline-hidden focus:border-red-700"
                />
              </div>
            </div>
          </div>

          {/* What's Included in the 8-Piece Bundle */}
          <div>
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
              Everything Included in this Turnkey Kit:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                '1x Uniform Shirt & Pant',
                '1x High-Ankle DMS Boots',
                '1x Woolen Beret & Hackle',
                '1x Brass Catch Web Belt',
                '1x Brass NCC Crest Badge',
                '1x Whistle & Braided Lanyard',
                '1x Engraved Name Plate',
                '2x Heavy Parade Socks'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 p-2 bg-stone-50 rounded-lg border border-stone-200 text-stone-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-medium leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Checkout Action */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-stone-900">
                  {formatINR(bundlePrice)}
                </span>
                <span className="text-sm text-stone-400 line-through">
                  {formatINR(regularPrice)}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  You Save ₹{savings}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Free Pan-India Delivery • Direct Bank UPI &amp; COD Available
              </p>
            </div>

            <button
              onClick={handleAddKitToCart}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-800 hover:bg-red-900 text-white shadow-red-900/20'
              }`}
            >
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Bundle Added to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Complete Kit to Bag</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
