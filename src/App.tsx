import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { KitBuilderModal } from './components/KitBuilderModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { InvoicePrint } from './components/InvoicePrint';
import { CustomerVerificationModal } from './components/CustomerVerificationModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { WingsBottomSheet } from './components/WingsBottomSheet';
import { Product, WingType, Order, PaymentMethod } from './types';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  PhoneCall, 
  Sparkles,
  ChevronRight,
  Filter,
  Lock,
  Flame,
  CheckCircle2,
  Award
} from 'lucide-react';

function MainApp() {
  const { 
    products, 
    activeView, 
    setActiveView, 
    settings, 
    isAdminAuthenticated 
  } = useStore();

  // Navigation & Filtering
  const [selectedWing, setSelectedWing] = useState<WingType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Sheets
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [preferredPayment, setPreferredPayment] = useState<PaymentMethod>('upi');
  const [productModalTarget, setProductModalTarget] = useState<Product | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [kitBuilderOpen, setKitBuilderOpen] = useState(false);
  const [trackOrderOpen, setTrackOrderOpen] = useState(false);
  const [orderSuccessTarget, setOrderSuccessTarget] = useState<Order | null>(null);
  const [invoicePrintTarget, setInvoicePrintTarget] = useState<Order | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [wingsSheetOpen, setWingsSheetOpen] = useState(false);

  // Filter Products
  const filteredProducts = products.filter(product => {
    // Wing filter
    if (selectedWing !== 'all' && product.wing !== selectedWing && product.wing !== 'common') {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchSubtitle = product.subtitle.toLowerCase().includes(q);
      const matchWing = product.wing.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      return matchName || matchSubtitle || matchWing || matchCategory;
    }
    return true;
  });

  // If in admin view and NOT authenticated, show separate Admin Login Page
  if (activeView === 'admin' && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col justify-start">
        <AdminLoginPage
          onSuccess={() => setActiveView('admin')}
          onCancel={() => setActiveView('store')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans flex flex-col selection:bg-amber-400 selection:text-stone-950">
      
      {/* Flipkart Style App Header */}
      <Header
        selectedWing={selectedWing}
        onSelectWing={setSelectedWing}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setCartOpen(true)}
        onOpenTrack={() => setTrackOrderOpen(true)}
        onOpenKitBuilder={() => setKitBuilderOpen(true)}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
        onOpenVerification={() => setVerificationOpen(true)}
        onOpenCustomer={() => setCustomerModalOpen(true)}
        onOpenAdminLogin={() => setActiveView('admin')}
      />

      {/* Main Content: Storefront vs Seller Admin */}
      {activeView === 'admin' && isAdminAuthenticated ? (
        <div className="flex-1 pb-24">
          <AdminDashboard
            onPrintInvoice={(order) => setInvoicePrintTarget(order)}
            onOpenOrderModal={() => {}}
          />
        </div>
      ) : (
        <main className="flex-1 pb-24 sm:pb-16">
          
          {/* Flipkart Category Circles & Deals Banner */}
          <HeroBanner
            onSelectWing={(wing) => {
              setSelectedWing(wing);
              window.scrollTo({ top: 320, behavior: 'smooth' });
            }}
            onOpenKitBuilder={() => setKitBuilderOpen(true)}
            onOpenSizeGuide={() => setSizeGuideOpen(true)}
          />

          {/* Product Listing Section */}
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-5">
            
            {/* Flipkart Category Chips Bar */}
            <div className="bg-white rounded-xl p-3 border border-stone-200 mb-3 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm sm:text-base font-black tracking-tight text-stone-900">
                    {selectedWing === 'all' 
                      ? 'Official Cadet Uniforms & Accessories' 
                      : selectedWing === 'army'
                      ? 'Army Wing Khaki Uniform Sets'
                      : selectedWing === 'navy'
                      ? 'Navy Wing Pristine White Sets'
                      : selectedWing === 'air'
                      ? 'Air Wing Sky Blue Sets'
                      : 'High-Ankle DMS Boots & Drill Gear'}
                  </h2>
                  <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-stone-200">
                    {filteredProducts.length} items
                  </span>
                </div>

                <button
                  onClick={() => setWingsSheetOpen(true)}
                  className="text-xs font-bold text-red-800 hover:text-red-900 flex items-center gap-1 cursor-pointer bg-red-50 px-2.5 py-1 rounded-lg border border-red-200"
                >
                  <span>Filter Wing</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sub-Category Pills Horizontal Scroll */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'uniform_set', label: 'Full Kits' },
                  { id: 'shirts_trousers', label: 'Uniform Sets' },
                  { id: 'boots', label: 'DMS Boots' },
                  { id: 'berets_hackles', label: 'Berets & Hackles' },
                  { id: 'belts_lanyards', label: 'Belts & Lanyards' },
                  { id: 'badges_ranks', label: 'Ranks & Badges' },
                  { id: 'drill_accessories', label: 'Brass Nameplates' },
                  { id: 'camp_pt', label: 'Camo & PT' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-red-800 text-white shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid: 2 Columns on Mobile, 3 on Tablet, 4 on Laptop, 5 on Desktop */}
            {filteredProducts.length === 0 ? (
              <div className="py-14 text-center space-y-2 bg-white rounded-xl border border-stone-200 p-6">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-stone-800">No uniforms found</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  No items matched "{searchQuery}". Try selecting another category or resetting filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedWing('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-stone-800"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={(p) => setProductModalTarget(p)}
                  />
                ))}
              </div>
            )}

            {/* Turnkey Cadet Parade Kit Banner - Dynamic Admin Editable */}
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-5 sm:p-7 shadow-xl relative overflow-hidden border border-stone-800">
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px] border border-amber-400/30">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{settings.banners?.promoBadge || 'Turnkey Solution for Senior & Junior Cadets'}</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black tracking-tight leading-tight">
                    {settings.banners?.promoTitle || 'Need a full uniform with boots, beret, belt & customized name plate?'}
                  </h3>
                  <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                    {settings.banners?.promoSubtitle || 'Save ₹700 when you order the complete 8-piece All-In-One Parade Kit. Laser-engraved brass nameplate included at zero extra cost.'}
                  </p>
                </div>

                <button
                  onClick={() => setKitBuilderOpen(true)}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0"
                >
                  <Sparkles className="w-4 h-4 fill-current text-stone-950" />
                  <span>{settings.banners?.promoCtaText || 'Launch Kit Customizer (Save ₹700)'}</span>
                </button>
              </div>
            </div>

            {/* Trust & Guarantee Strip */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-50 text-[#b71c1c] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">DG NCC Dress Regulations</h4>
                  <p className="text-[11px] text-stone-500">100% compliant with Directorate General standards</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Direct Bank / UPI &amp; COD</h4>
                  <p className="text-[11px] text-stone-500">Zero fee direct deposit &amp; cash on delivery</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-[#2874f0] shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Pan-India Speed Post</h4>
                  <p className="text-[11px] text-stone-500">Fast dispatch to college battalions across India</p>
                </div>
              </div>
            </div>

          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs border-t border-stone-800 p-4 sm:p-8 pb-24 sm:pb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm uppercase">
                NCC Uniforms &amp; Cadet Outfitters
              </span>
              <span className="bg-[#2874f0] text-white font-bold text-[10px] px-1.5 py-0.2 rounded">
                Flipkart Store
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Helpline: <strong className="text-white">{settings.supportPhone}</strong> • Direct UPI: <strong className="text-emerald-400">{settings.upiId}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('admin')}
              className="text-stone-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-lg border border-stone-700 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAdminAuthenticated ? 'Admin Panel' : 'Store Owner Login'}</span>
            </button>
            <span className="text-[11px] text-stone-500">
              © {new Date().getFullYear()} DG NCC Regulation Approved
            </span>
          </div>
        </div>
      </footer>

      {/* Flipkart Style Mobile Bottom Navigation Bar (With Customer replacing Login) */}
      <MobileBottomNav
        onOpenCart={() => setCartOpen(true)}
        onOpenKitBuilder={() => setKitBuilderOpen(true)}
        onOpenWingsSheet={() => setWingsSheetOpen(true)}
        onOpenCustomer={() => setCustomerModalOpen(true)}
        selectedWing={selectedWing}
      />

      {/* Flipkart Style Customer Account Modal */}
      <CustomerAccountModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onOpenOrders={() => setTrackOrderOpen(true)}
        onOpenVerification={() => setVerificationOpen(true)}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
        onOpenKitBuilder={() => setKitBuilderOpen(true)}
        onOpenAdminLogin={() => setActiveView('admin')}
      />

      {/* Quick Wings Category Bottom Drawer Sheet */}
      <WingsBottomSheet
        isOpen={wingsSheetOpen}
        onClose={() => setWingsSheetOpen(false)}
        selectedWing={selectedWing}
        onSelectWing={(wing) => {
          setSelectedWing(wing);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        products={products}
      />

      {/* Customer Mobile & OTP Verification Modal */}
      <CustomerVerificationModal
        isOpen={verificationOpen}
        onClose={() => setVerificationOpen(false)}
      />

      {/* Slide-over Cart */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onProceedToCheckout={(mode) => {
          if (mode) setPreferredPayment(mode);
          setCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        initialPaymentMethod={preferredPayment}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={(order) => setOrderSuccessTarget(order)}
      />

      {/* Product Details Modal */}
      <ProductModal
        product={productModalTarget}
        onClose={() => setProductModalTarget(null)}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* Sizing Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />

      {/* Turnkey Kit Builder Modal */}
      <KitBuilderModal
        isOpen={kitBuilderOpen}
        onClose={() => setKitBuilderOpen(false)}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* Order Tracker Modal */}
      <TrackOrderModal
        isOpen={trackOrderOpen}
        onClose={() => setTrackOrderOpen(false)}
      />

      {/* Order Success Confetti Modal */}
      <OrderSuccessModal
        order={orderSuccessTarget}
        onClose={() => setOrderSuccessTarget(null)}
        onOpenTrack={() => setTrackOrderOpen(true)}
        onPrintInvoice={(order) => setInvoicePrintTarget(order)}
      />

      {/* Printable Invoice */}
      <InvoicePrint
        order={invoicePrintTarget}
        onClose={() => setInvoicePrintTarget(null)}
      />

    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
