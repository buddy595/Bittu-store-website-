import React, { useState } from 'react';
import { X, Ruler, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'uniform' | 'boots' | 'beret'>('uniform');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-red-100 text-red-800">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900">
              DG NCC Uniform &amp; Gear Sizing Chart
            </h2>
            <p className="text-xs text-stone-500">
              Official measurement specifications for parade inspections &amp; squad drill
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex rounded-xl bg-stone-100 p-1 mb-5">
          <button
            onClick={() => setActiveTab('uniform')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'uniform'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Uniform (Shirt &amp; Trouser)
          </button>
          <button
            onClick={() => setActiveTab('boots')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'boots'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            DMS Boots (Footwear)
          </button>
          <button
            onClick={() => setActiveTab('beret')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'beret'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Woolen Beret (Head)
          </button>
        </div>

        {/* Tab 1: Uniform Shirt & Trousers */}
        {activeTab === 'uniform' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-stone-200 rounded-lg">
                <thead className="bg-stone-100 text-stone-800 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 border-b">Size</th>
                    <th className="py-2.5 px-3 border-b">Chest (Inches)</th>
                    <th className="py-2.5 px-3 border-b">Waist (Inches)</th>
                    <th className="py-2.5 px-3 border-b">Collar</th>
                    <th className="py-2.5 px-3 border-b">Trouser Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold text-stone-900">34 (XS / JD)</td>
                    <td className="py-2 px-3">34" - 35"</td>
                    <td className="py-2 px-3">28" - 29"</td>
                    <td className="py-2 px-3">14.0"</td>
                    <td className="py-2 px-3">37" - 38"</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold text-stone-900">36 (Small)</td>
                    <td className="py-2 px-3">36" - 37"</td>
                    <td className="py-2 px-3">30" - 31"</td>
                    <td className="py-2 px-3">14.5"</td>
                    <td className="py-2 px-3">38" - 39"</td>
                  </tr>
                  <tr className="hover:bg-stone-50 bg-amber-50/50">
                    <td className="py-2 px-3 font-bold text-amber-900">38 (Medium - Most Common)</td>
                    <td className="py-2 px-3 font-semibold text-amber-900">38" - 39"</td>
                    <td className="py-2 px-3">32" - 33"</td>
                    <td className="py-2 px-3">15.0"</td>
                    <td className="py-2 px-3">39" - 40"</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold text-stone-900">40 (Large)</td>
                    <td className="py-2 px-3">40" - 41"</td>
                    <td className="py-2 px-3">34" - 35"</td>
                    <td className="py-2 px-3">15.5"</td>
                    <td className="py-2 px-3">40" - 41"</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold text-stone-900">42 (XL)</td>
                    <td className="py-2 px-3">42" - 43"</td>
                    <td className="py-2 px-3">36" - 37"</td>
                    <td className="py-2 px-3">16.0"</td>
                    <td className="py-2 px-3">41" - 42"</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold text-stone-900">44 (XXL)</td>
                    <td className="py-2 px-3">44" - 45"</td>
                    <td className="py-2 px-3">38" - 40"</td>
                    <td className="py-2 px-3">16.5"</td>
                    <td className="py-2 px-3">42" - 43"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Parade Fitting Rules:
              </span>
              <p>• Uniform shirt is tailored with double-box pleats and 2 inches ease for drill saluting.</p>
              <p>• Trousers are un-hemmed at the base with extra 2 inches fabric to allow exact heel adjustment above DMS boots.</p>
            </div>
          </div>
        )}

        {/* Tab 2: DMS Boots */}
        {activeTab === 'boots' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-stone-200 rounded-lg">
                <thead className="bg-stone-100 text-stone-800 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 border-b">India / UK Size</th>
                    <th className="py-2.5 px-3 border-b">Foot Length (cm)</th>
                    <th className="py-2.5 px-3 border-b">Euro Size</th>
                    <th className="py-2.5 px-3 border-b">Recommended Socks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {['UK 5 (24.5 cm / EU 39)', 'UK 6 (25.3 cm / EU 40)', 'UK 7 (26.0 cm / EU 41)', 'UK 8 (26.8 cm / EU 42)', 'UK 9 (27.5 cm / EU 43)', 'UK 10 (28.3 cm / EU 44)', 'UK 11 (29.0 cm / EU 45)'].map((row, i) => {
                    const [size, rest] = row.split(' (');
                    const [cm, eu] = rest.replace(')', '').split(' / ');
                    return (
                      <tr key={size} className={size === 'UK 7' || size === 'UK 8' ? 'bg-amber-50/50' : 'hover:bg-stone-50'}>
                        <td className="py-2 px-3 font-bold text-stone-900">{size}</td>
                        <td className="py-2 px-3">{cm}</td>
                        <td className="py-2 px-3">{eu}</td>
                        <td className="py-2 px-3 text-stone-500">Heavy Military Woolen Socks</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Pro Tip for Cadets:</strong> Always order DMS boots according to your regular sports shoe size. Since thick woolen drill socks are worn during parade, the boots are engineered with appropriate toe room.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Woolen Beret */}
        {activeTab === 'beret' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-stone-200 rounded-lg">
                <thead className="bg-stone-100 text-stone-800 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 border-b">Beret Size</th>
                    <th className="py-2.5 px-3 border-b">Head Circumference (Inches)</th>
                    <th className="py-2.5 px-3 border-b">Metric (cm)</th>
                    <th className="py-2.5 px-3 border-b">Fit Advice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold text-stone-900">6.75 inch (Small)</td>
                    <td className="py-2 px-3">21.0" - 21.5"</td>
                    <td className="py-2 px-3">54 - 55 cm</td>
                    <td className="py-2 px-3 text-stone-500">Junior Division (JD/JW)</td>
                  </tr>
                  <tr className="hover:bg-stone-50 bg-amber-50/50">
                    <td className="py-2 px-3 font-bold text-amber-900">7.0 inch (Medium)</td>
                    <td className="py-2 px-3 font-semibold text-amber-900">22.0" - 22.5"</td>
                    <td className="py-2 px-3">56 - 57 cm</td>
                    <td className="py-2 px-3 text-stone-600 font-medium">Standard Senior Division (SD/SW)</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold text-stone-900">7.25 inch (Large)</td>
                    <td className="py-2 px-3">23.0" - 23.5"</td>
                    <td className="py-2 px-3">58 - 59 cm</td>
                    <td className="py-2 px-3 text-stone-500">Broad forehead or thick hair</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-bold text-stone-900">7.5 inch (XL)</td>
                    <td className="py-2 px-3">24.0"</td>
                    <td className="py-2 px-3">60 - 61 cm</td>
                    <td className="py-2 px-3 text-stone-500">Extra Large</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
              <span className="font-bold text-stone-900">How to Shape Your Beret:</span>
              <p>1. Measure around head 1 inch above eyebrows and just above ears.</p>
              <p>2. Shave inner fuzz with a razor, dip in lukewarm water, and pull excess wool downwards over right ear for a razor-sharp parade crease.</p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer"
          >
            Got It, Thanks
          </button>
        </div>
      </div>
    </div>
  );
};
