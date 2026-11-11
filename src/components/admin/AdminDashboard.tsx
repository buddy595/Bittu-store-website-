import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Package, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Search, 
  Filter, 
  Printer, 
  MessageCircle, 
  Edit3, 
  Plus, 
  Save, 
  QrCode, 
  ShieldCheck, 
  Eye, 
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Trash2,
  LogOut,
  Sliders,
  DollarSign,
  AlertTriangle,
  X,
  PhoneCall,
  Sparkles,
  Award
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus, Product, WingType, ProductCategory, BannerSettings } from '../../types';
import { formatINR, buildUpiUri, generateQrDataUrl } from '../../utils/upi';

interface AdminDashboardProps {
  onPrintInvoice: (order: Order) => void;
  onOpenOrderModal: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onPrintInvoice
}) => {
  const { 
    orders, 
    products, 
    settings, 
    adminLogout,
    updateSettings, 
    updateOrderStatus, 
    updatePaymentStatus, 
    updateProduct, 
    addProduct, 
    deleteProduct,
    toggleStockStatus,
    updateStockCount,
    updatePrice,
    resetCatalogToDefault 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'banners' | 'bank_settings' | 'analytics'>('products');
  
  // Product & Stock Management Filter
  const [productSearch, setProductSearch] = useState('');
  const [productWingFilter, setProductWingFilter] = useState<'all' | 'army' | 'navy' | 'air' | 'common'>('all');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'low_stock'>('all');
  
  // Product Edit Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Add Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductImagePreview, setNewProductImagePreview] = useState<string>('');
  const [newProductForm, setNewProductForm] = useState<{
    name: string;
    subtitle: string;
    wing: WingType;
    category: ProductCategory;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    description: string;
    inStock: boolean;
    stockCount: number;
    availableSizes: string;
    isCustomizable: boolean;
  }>({
    name: '',
    subtitle: 'DG NCC Inspection Grade',
    wing: 'army',
    category: 'shirts_trousers',
    price: 999,
    originalPrice: 1299,
    imageUrl: '',
    description: 'High-durability cadet uniform fabric meeting official specifications.',
    inStock: true,
    stockCount: 50,
    availableSizes: '34, 36, 38, 40, 42, 44',
    isCustomizable: false
  });

  // Orders State
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'verified' | 'cod' | 'dispatched'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [dispatchOrderTarget, setDispatchOrderTarget] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState('Speed Post (India Post)');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Settings State
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Banners Form State (Direct Banner Editing in Admin Panel)
  const defaultBanners: BannerSettings = {
    heroBadge: "National Cadet Corps Authorized Specification",
    heroTitle: "Official Uniforms, DMS Boots & Drill Gear for Cadets",
    heroSubtitle: "Equip yourself for CATC, ATC camps, and Republic Day Parade selections. Authentic drill-weight fabrics, iron-heel DMS boots, woolen berets, brass crests, and custom-engraved nameplates.",
    heroCtaText: "Build All-In-One Cadet Kit (Save ₹700)",
    promoBadge: "Turnkey Solution for Senior & Junior Cadets",
    promoTitle: "Need a full uniform with boots, beret, belt & customized name plate?",
    promoSubtitle: "Save ₹700 when you order the complete 8-piece All-In-One Parade Kit. Laser-engraved brass nameplate included at zero extra cost.",
    promoDiscountText: "Save ₹700",
    promoCtaText: "Launch Kit Customizer (Save ₹700)"
  };

  const [bannersForm, setBannersForm] = useState<BannerSettings>(
    settings.banners || defaultBanners
  );
  const [bannersSaved, setBannersSaved] = useState(false);

  const handleSaveBanners = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      banners: bannersForm
    });
    setBannersSaved(true);
    setTimeout(() => setBannersSaved(false), 2500);
  };

  // File input refs for uploading photos from device
  const addFileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // Test QR generator state
  const [testAmount, setTestAmount] = useState<number>(500);
  const [testQrUrl, setTestQrUrl] = useState<string>('');

  React.useEffect(() => {
    const upiUri = buildUpiUri({
      upiId: settingsForm.upiId,
      payeeName: settingsForm.accountHolderName || settingsForm.storeName,
      amount: testAmount,
      orderId: 'TEST-PREVIEW'
    });
    generateQrDataUrl(upiUri).then(url => setTestQrUrl(url));
  }, [settingsForm.upiId, settingsForm.accountHolderName, testAmount]);

  // Handle Photo Upload for Add Product
  const handleAddPhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setNewProductImagePreview(result);
        setNewProductForm(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Photo Upload for Edit Product
  const handleEditPhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditingProduct(prev => prev ? { ...prev, imageUrl: result } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase());
    
    if (!matchesSearch) return false;

    if (productWingFilter !== 'all' && p.wing !== productWingFilter) return false;

    if (productStockFilter === 'in_stock') return p.inStock && p.stockCount > 0;
    if (productStockFilter === 'out_of_stock') return !p.inStock || p.stockCount === 0;
    if (productStockFilter === 'low_stock') return p.stockCount > 0 && p.stockCount <= 10;

    return true;
  });

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.phone.includes(orderSearch) ||
      o.customer.battalionUnit.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.utrNumber && o.utrNumber.toLowerCase().includes(orderSearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (orderFilter === 'pending') return o.orderStatus === 'pending_payment';
    if (orderFilter === 'verified') return o.paymentStatus === 'verified' && o.orderStatus !== 'dispatched' && o.orderStatus !== 'delivered';
    if (orderFilter === 'cod') return o.paymentMethod === 'cod';
    if (orderFilter === 'dispatched') return o.orderStatus === 'dispatched';
    return true;
  });

  // Metrics
  const directBankRevenue = orders
    .filter(o => (o.paymentMethod === 'upi' || o.paymentMethod === 'bank_transfer') && o.paymentStatus === 'verified')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const codTotalRevenue = orders
    .filter(o => o.paymentMethod === 'cod')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const outOfStockCount = products.filter(p => !p.inStock || p.stockCount === 0).length;
  const lowStockCount = products.filter(p => p.inStock && p.stockCount > 0 && p.stockCount <= 10).length;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleConfirmDispatch = () => {
    if (dispatchOrderTarget) {
      updateOrderStatus(
        dispatchOrderTarget.id,
        'dispatched',
        'Package dispatched with tracking',
        courierName,
        trackingNumber || `SP${Math.floor(100000000 + Math.random() * 900000000)}IN`
      );
      setDispatchOrderTarget(null);
      setTrackingNumber('');
    }
  };

  const handleSaveEditedProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, editingProduct);
      setEditingProduct(null);
    }
  };

  const handleCreateNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price) return;

    const fallbackImg = newProductForm.wing === 'navy' 
      ? 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
      : newProductForm.wing === 'air'
      ? 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80';

    const sizes = newProductForm.availableSizes
      ? newProductForm.availableSizes.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const fullProduct: Product = {
      id: `ncc-item-${Date.now()}`,
      name: newProductForm.name.trim(),
      subtitle: newProductForm.subtitle.trim(),
      wing: newProductForm.wing,
      category: newProductForm.category,
      price: Number(newProductForm.price),
      originalPrice: newProductForm.originalPrice ? Number(newProductForm.originalPrice) : undefined,
      rating: 5.0,
      reviewsCount: 1,
      imageUrl: newProductForm.imageUrl.trim() || fallbackImg,
      description: newProductForm.description.trim(),
      features: ['DG NCC compliant drill grade', 'Inspection approved stitching'],
      inStock: newProductForm.inStock,
      stockCount: Number(newProductForm.stockCount || 50),
      availableSizes: sizes,
      isCustomizable: newProductForm.isCustomizable
    };

    addProduct(fullProduct);
    setShowAddProductModal(false);
    // Reset form
    setNewProductForm({
      name: '',
      subtitle: 'DG NCC Inspection Grade',
      wing: 'army',
      category: 'shirts_trousers',
      price: 999,
      originalPrice: 1299,
      imageUrl: '',
      description: 'High-durability cadet uniform fabric meeting official specifications.',
      inStock: true,
      stockCount: 50,
      availableSizes: '34, 36, 38, 40, 42, 44',
      isCustomizable: false
    });
    setNewProductImagePreview('');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 pb-20">
      
      {/* Top Banner & Header */}
      <div className="bg-stone-900 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-700 text-white font-black text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">
                  Authenticated Admin
                </span>
                <span className="text-xs text-stone-400">
                  Store Owner: <strong className="text-stone-200">{settings.ownerName}</strong>
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight">
                NCC Uniforms Store &amp; Stock Management
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                Full control over product photos, prices, inventory levels, in-stock switches, and direct bank payouts.
              </p>
            </div>

            {/* Quick Actions & Logout */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your Own Stock / Item</span>
              </button>

              <button
                onClick={adminLogout}
                className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-stone-700 cursor-pointer transition-colors"
                title="Log out from Admin session"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 sm:space-x-2 mt-6 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'bg-red-800 text-white shadow-md'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Full Stock &amp; Price Manager</span>
              <span className="bg-stone-900 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-red-800 text-white shadow-md'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Cadet Orders &amp; Dispatch</span>
              <span className="bg-stone-900 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'banners'
                  ? 'bg-red-800 text-white shadow-md'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Banners &amp; Promos</span>
              <span className="bg-amber-400 text-stone-950 text-[9px] font-black px-1.5 py-0.2 rounded">
                Edit
              </span>
            </button>

            <button
              onClick={() => setActiveTab('bank_settings')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'bank_settings'
                  ? 'bg-red-800 text-white shadow-md'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Helpline, Store &amp; Bank Settings</span>
              <span className="bg-emerald-950 text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-700">
                Direct to Bank
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-red-800 text-white shadow-md'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Revenue &amp; Payouts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* =========================================================================
            TAB 1: FULL STOCK, PHOTO & PRICE MANAGEMENT (PRIMARY USER REQUEST)
           ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            
            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Total Catalog Items
                </span>
                <span className="text-2xl font-black text-stone-900 mt-1 block">
                  {products.length}
                </span>
                <span className="text-[11px] text-stone-400">Uniforms &amp; Accessories</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  In Stock Active
                </span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">
                  {products.filter(p => p.inStock && p.stockCount > 0).length}
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">Ready for Cadet Orders</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Low Stock Alert
                </span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">
                  {lowStockCount}
                </span>
                <span className="text-[11px] text-stone-400">Fewer than 10 units left</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Marked Out of Stock
                </span>
                <span className="text-2xl font-black text-red-700 mt-1 block">
                  {outOfStockCount}
                </span>
                <span className="text-[11px] text-stone-400">Hidden from instant checkout</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search item name, subtitle, ID..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:border-red-800"
                />
              </div>

              {/* Wing Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                <span className="text-xs font-bold text-stone-500 uppercase mr-1">Wing:</span>
                {[
                  { id: 'all', label: 'All Wings' },
                  { id: 'army', label: 'Army' },
                  { id: 'navy', label: 'Navy' },
                  { id: 'air', label: 'Air' },
                  { id: 'common', label: 'Common' }
                ].map(w => (
                  <button
                    key={w.id}
                    onClick={() => setProductWingFilter(w.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      productWingFilter === w.id
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              {/* Stock Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                <span className="text-xs font-bold text-stone-500 uppercase mr-1">Stock:</span>
                <select
                  value={productStockFilter}
                  onChange={(e) => setProductStockFilter(e.target.value as any)}
                  className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 focus:outline-hidden"
                >
                  <option value="all">All Status</option>
                  <option value="in_stock">In Stock Only</option>
                  <option value="low_stock">Low Stock (≤ 10)</option>
                  <option value="out_of_stock">Out of Stock (0)</option>
                </select>
              </div>

              {/* Reset to Default */}
              <button
                onClick={resetCatalogToDefault}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                title="Restore default standard NCC catalog"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Default</span>
              </button>

            </div>

            {/* Products Table with Quick Photo, Price & Stock Controls */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full min-w-[760px] text-xs text-left">
                  <thead className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500">
                    <tr>
                      <th className="py-3 px-4">Photo</th>
                      <th className="py-3 px-4">Product Details</th>
                      <th className="py-3 px-4">Selling Price (₹)</th>
                      <th className="py-3 px-4">MRP / Original (₹)</th>
                      <th className="py-3 px-4">Stock Units</th>
                      <th className="py-3 px-4">In Stock Switch</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-stone-400">
                          No uniform items match your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map(product => {
                        const isOutOfStock = !product.inStock || product.stockCount === 0;

                        return (
                          <tr key={product.id} className="hover:bg-stone-50/80 transition-colors">
                            {/* Photo Column with Instant Photo Change Button */}
                            <td className="py-3 px-4">
                              <div className="relative group/img w-14 h-14 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() => setEditingProduct(product)}
                                  className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                                  title="Change Photo"
                                >
                                  <ImageIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>

                            {/* Title & Subtitle */}
                            <td className="py-3 px-4 max-w-xs">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                  product.wing === 'army' 
                                    ? 'bg-red-100 text-red-900' 
                                    : product.wing === 'navy' 
                                    ? 'bg-blue-100 text-blue-900' 
                                    : product.wing === 'air'
                                    ? 'bg-sky-100 text-sky-900'
                                    : 'bg-stone-100 text-stone-800'
                                }`}>
                                  {product.wing}
                                </span>
                                <span className="text-[10px] text-stone-400 font-mono">
                                  #{product.id.split('-').pop()}
                                </span>
                              </div>
                              <h4 className="font-bold text-stone-900 line-clamp-1 text-xs">
                                {product.name}
                              </h4>
                              <p className="text-[11px] text-stone-500 line-clamp-1">
                                {product.subtitle}
                              </p>
                              {product.availableSizes && (
                                <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                                  Sizes: {product.availableSizes.join(', ')}
                                </p>
                              )}
                            </td>

                            {/* Selling Price - Quick Input */}
                            <td className="py-3 px-4">
                              <div className="relative w-24">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">₹</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={product.price}
                                  onChange={(e) => updatePrice(product.id, Number(e.target.value), product.originalPrice)}
                                  className="w-full pl-6 pr-2 py-1.5 bg-stone-50 hover:bg-white focus:bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-hidden focus:border-red-800"
                                />
                              </div>
                            </td>

                            {/* Original MRP - Quick Input */}
                            <td className="py-3 px-4">
                              <div className="relative w-24">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">₹</span>
                                <input
                                  type="number"
                                  min={0}
                                  placeholder="MRP"
                                  value={product.originalPrice || ''}
                                  onChange={(e) => updatePrice(product.id, product.price, e.target.value ? Number(e.target.value) : undefined)}
                                  className="w-full pl-6 pr-2 py-1.5 bg-stone-50 hover:bg-white focus:bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-500 focus:outline-hidden focus:border-red-800"
                                />
                              </div>
                            </td>

                            {/* Stock Units - Quick Increment / Decrement & Input */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => updateStockCount(product.id, product.stockCount - 1)}
                                  className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center cursor-pointer"
                                  title="Decrease Stock"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={0}
                                  value={product.stockCount}
                                  onChange={(e) => updateStockCount(product.id, Number(e.target.value))}
                                  className={`w-14 text-center py-1 bg-stone-50 border rounded-lg text-xs font-bold ${
                                    isOutOfStock 
                                      ? 'text-red-700 border-red-300 bg-red-50' 
                                      : product.stockCount <= 10 
                                      ? 'text-amber-700 border-amber-300 bg-amber-50' 
                                      : 'text-stone-900 border-stone-300'
                                  }`}
                                />
                                <button
                                  onClick={() => updateStockCount(product.id, product.stockCount + 5)}
                                  className="px-1.5 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[10px] flex items-center justify-center cursor-pointer"
                                  title="Add +5 Units"
                                >
                                  +5
                                </button>
                              </div>
                            </td>

                            {/* In Stock Switch (User Requested Tool) */}
                            <td className="py-3 px-4">
                              <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={product.inStock && product.stockCount > 0}
                                  onChange={(e) => toggleStockStatus(product.id, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                                <span className={`text-[11px] font-bold ${
                                  product.inStock && product.stockCount > 0
                                    ? 'text-emerald-700'
                                    : 'text-red-600'
                                }`}>
                                  {product.inStock && product.stockCount > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </label>
                            </td>

                            {/* Actions: Edit & Remove (User Requested) */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingProduct(product)}
                                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition-colors"
                                  title="Edit Photo, Description &amp; Details"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to remove "${product.name}" from your store?`)) {
                                      deleteProduct(product.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer transition-colors"
                                  title="Remove Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 2: CUSTOMER ORDERS & DISPATCH MANAGEMENT
           ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Cadet Name, Order ID, UTR..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-800 focus:outline-hidden focus:border-red-700"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    orderFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    orderFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Pending ({orders.filter(o => o.orderStatus === 'pending_payment').length})
                </button>
                <button
                  onClick={() => setOrderFilter('verified')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    orderFilter === 'verified' ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Payment Verified
                </button>
                <button
                  onClick={() => setOrderFilter('cod')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    orderFilter === 'cod' ? 'bg-stone-800 text-amber-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  COD Orders
                </button>
                <button
                  onClick={() => setOrderFilter('dispatched')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    orderFilter === 'dispatched' ? 'bg-blue-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Dispatched
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full min-w-[780px] text-xs text-left">
                  <thead className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500">
                    <tr>
                      <th className="py-3 px-4">Order / Cadet</th>
                      <th className="py-3 px-4">Wing &amp; Battalion</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Amount &amp; Mode</th>
                      <th className="py-3 px-4">Bank Verification / UTR</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-stone-400">
                          No orders match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const isUpi = order.paymentMethod === 'upi';
                        const isCod = order.paymentMethod === 'cod';

                        return (
                          <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-bold text-stone-900 block">
                                {order.id}
                              </span>
                              <span className="font-bold text-stone-800 text-xs block">
                                {order.customer.fullName}
                              </span>
                              <span className="text-[11px] text-stone-500">
                                +91 {order.customer.phone}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`inline-block font-bold text-[9px] px-1.5 py-0.2 rounded uppercase mb-0.5 ${
                                order.customer.wing === 'army' 
                                  ? 'bg-red-100 text-red-900' 
                                  : order.customer.wing === 'navy' 
                                  ? 'bg-blue-100 text-blue-900' 
                                  : 'bg-sky-100 text-sky-900'
                              }`}>
                                {order.customer.wing} Wing
                              </span>
                              <p className="text-stone-700 font-medium line-clamp-1">
                                {order.customer.battalionUnit}
                              </p>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-stone-800">
                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                              </span>
                              <p className="text-[11px] text-stone-500 line-clamp-1">
                                {order.items[0]?.product.name}
                              </p>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="font-black text-stone-900 text-sm block">
                                {formatINR(order.totalAmount)}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                                isUpi ? 'text-emerald-700' : isCod ? 'text-amber-800' : 'text-blue-700'
                              }`}>
                                {isUpi ? 'Direct UPI' : isCod ? 'Cash on Deliv.' : 'Direct IMPS'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              {order.paymentStatus === 'verified' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Bank Verified</span>
                                </span>
                              ) : isCod ? (
                                <span className="inline-flex items-center gap-1 text-amber-800 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  <span>COD (Pay on Delivery)</span>
                                </span>
                              ) : order.utrNumber ? (
                                <div>
                                  <span className="text-[10px] text-stone-400 uppercase font-bold block">
                                    Submitted UTR:
                                  </span>
                                  <code className="font-mono font-bold text-xs text-stone-900 bg-stone-100 px-1 py-0.5 rounded">
                                    {order.utrNumber}
                                  </code>
                                  <button
                                    onClick={() => updatePaymentStatus(order.id, 'verified', order.utrNumber)}
                                    className="block mt-1 text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                                  >
                                    Verify &amp; Confirm
                                  </button>
                                </div>
                              ) : (
                                <span className="text-amber-600 font-semibold text-[11px]">
                                  Awaiting UTR
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                order.orderStatus === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : order.orderStatus === 'dispatched'
                                  ? 'bg-blue-100 text-blue-900'
                                  : order.orderStatus === 'processing'
                                  ? 'bg-purple-100 text-purple-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}>
                                {order.orderStatus.replace('_', ' ')}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onPrintInvoice(order)}
                                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                                  title="Print Cadet Invoice / Dispatch Slip"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>

                                <a
                                  href={`https://wa.me/91${order.customer.phone}?text=${encodeURIComponent(
                                    `Jai Hind Cadet ${order.customer.fullName}! Update on your NCC Uniform order ${order.id}: Status is now ${order.orderStatus.toUpperCase()}.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 cursor-pointer"
                                  title="WhatsApp Cadet"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>

                                {order.orderStatus !== 'dispatched' && order.orderStatus !== 'delivered' && (
                                  <button
                                    onClick={() => setDispatchOrderTarget(order)}
                                    className="px-2.5 py-1 bg-red-800 hover:bg-red-900 text-white font-bold text-[11px] rounded-lg cursor-pointer flex items-center gap-1 shadow-xs"
                                  >
                                    <Truck className="w-3 h-3" />
                                    <span>Dispatch</span>
                                  </button>
                                )}

                                {order.orderStatus === 'dispatched' && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg cursor-pointer flex items-center gap-1 shadow-xs"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Delivered</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB: DIRECT BANNER & HERO EDITOR (USER REQUESTED)
           ========================================================================= */}
        {activeTab === 'banners' && (
          <div className="space-y-8">
            {/* Header info */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-100 text-amber-800">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-stone-900">
                    Store Banners &amp; Hero Editor
                  </h2>
                  <p className="text-xs text-stone-500">
                    Directly customize the storefront Hero Banner and Promotional Cadet Kit Banner. Changes appear instantly on the main screen.
                  </p>
                </div>
              </div>

              {bannersSaved && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Banners updated live on store!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form Column */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
                <form onSubmit={handleSaveBanners} className="space-y-6">
                  
                  {/* SECTION 1: HERO MAIN BANNER */}
                  <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-700"></span>
                      <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                        1. Main Storefront Hero Banner
                      </h3>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">
                        Top Badge Tag Text:
                      </label>
                      <input
                        type="text"
                        value={bannersForm.heroBadge}
                        onChange={(e) => setBannersForm({ ...bannersForm, heroBadge: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-hidden focus:border-red-700"
                        placeholder="e.g. National Cadet Corps Authorized Specification"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">
                        Main Hero Headline:
                      </label>
                      <input
                        type="text"
                        value={bannersForm.heroTitle}
                        onChange={(e) => setBannersForm({ ...bannersForm, heroTitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-red-700"
                        placeholder="e.g. Official Uniforms, DMS Boots & Drill Gear for Cadets"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">
                        Hero Description / Subtitle:
                      </label>
                      <textarea
                        rows={3}
                        value={bannersForm.heroSubtitle}
                        onChange={(e) => setBannersForm({ ...bannersForm, heroSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-hidden focus:border-red-700 leading-relaxed"
                        placeholder="Describe your uniforms, drill regulations, CATC/RDC camp readiness..."
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">
                        Primary CTA Button Label:
                      </label>
                      <input
                        type="text"
                        value={bannersForm.heroCtaText}
                        onChange={(e) => setBannersForm({ ...bannersForm, heroCtaText: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-hidden focus:border-red-700 font-semibold"
                        placeholder="e.g. Build All-In-One Cadet Kit (Save ₹700)"
                        required
                      />
                    </div>
                  </div>

                  {/* SECTION 2: PROMOTIONAL CADET KIT BANNER */}
                  <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                        2. Promotional Turnkey Cadet Kit Banner
                      </h3>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">
                        Promo Badge Tag:
                      </label>
                      <input
                        type="text"
                        value={bannersForm.promoBadge}
                        onChange={(e) => setBannersForm({ ...bannersForm, promoBadge: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-hidden focus:border-amber-600"
                        placeholder="e.g. Turnkey Solution for Senior & Junior Cadets"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">
                        Promo Heading:
                      </label>
                      <input
                        type="text"
                        value={bannersForm.promoTitle}
                        onChange={(e) => setBannersForm({ ...bannersForm, promoTitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-amber-600"
                        placeholder="e.g. Need a full uniform with boots, beret, belt & customized name plate?"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">
                        Promo Description:
                      </label>
                      <textarea
                        rows={2}
                        value={bannersForm.promoSubtitle}
                        onChange={(e) => setBannersForm({ ...bannersForm, promoSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-hidden focus:border-amber-600"
                        placeholder="e.g. Save ₹700 when you order the complete 8-piece kit..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700">
                          Discount Callout:
                        </label>
                        <input
                          type="text"
                          value={bannersForm.promoDiscountText}
                          onChange={(e) => setBannersForm({ ...bannersForm, promoDiscountText: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-hidden focus:border-amber-600 font-semibold"
                          placeholder="e.g. Save ₹700"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700">
                          Button CTA Text:
                        </label>
                        <input
                          type="text"
                          value={bannersForm.promoCtaText}
                          onChange={(e) => setBannersForm({ ...bannersForm, promoCtaText: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-800 focus:outline-hidden focus:border-amber-600 font-semibold"
                          placeholder="e.g. Launch Kit Customizer (Save ₹700)"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save All Banners</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBannersForm(defaultBanners);
                        updateSettings({ ...settings, banners: defaultBanners });
                        setBannersSaved(true);
                        setTimeout(() => setBannersSaved(false), 2000);
                      }}
                      className="px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer transition-colors"
                    >
                      Reset to Default Text
                    </button>
                  </div>

                </form>
              </div>

              {/* Live Preview Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="sticky top-24 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      Live Customer Preview
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Updates As You Type
                    </span>
                  </div>

                  {/* 1. Live Hero Preview Card */}
                  <div className="rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 text-white p-5 shadow-lg border border-stone-800 space-y-3">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-800 text-amber-400 text-[10px] font-bold border border-stone-700">
                      <Award className="w-3 h-3 text-amber-400" />
                      <span>{bannersForm.heroBadge}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight text-white">
                      {bannersForm.heroTitle}
                    </h3>

                    <p className="text-stone-300 text-xs leading-relaxed line-clamp-3">
                      {bannersForm.heroSubtitle}
                    </p>

                    <div className="pt-1">
                      <div className="w-full py-2 px-3 rounded-lg bg-amber-400 text-stone-950 font-black text-xs text-center flex items-center justify-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3 fill-current" />
                        <span>{bannersForm.heroCtaText}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Live Promotional Banner Preview Card */}
                  <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-4 shadow-lg border border-stone-800 space-y-2">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[9px] border border-amber-400/30">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      <span>{bannersForm.promoBadge}</span>
                    </div>

                    <h4 className="text-sm font-black tracking-tight leading-tight">
                      {bannersForm.promoTitle}
                    </h4>

                    <p className="text-stone-300 text-[11px] leading-relaxed line-clamp-2">
                      {bannersForm.promoSubtitle}
                    </p>

                    <div className="pt-1">
                      <div className="w-full py-2 px-3 rounded-lg bg-amber-400 text-stone-950 font-black text-xs text-center shadow-xs">
                        {bannersForm.promoCtaText}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-[11px] text-stone-600">
                    💡 <strong>Tip:</strong> You can change slogans, camp selection notices, RDC parade highlights, and bundle discounts anytime without code editing.
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: STORE HELPLINE, DIRECT BANK ACCOUNT & PAYOUT SETTINGS
           ========================================================================= */}
        {activeTab === 'bank_settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-stone-900">
                    Store Helpline &amp; Bank Settings
                  </h2>
                  <p className="text-xs text-stone-500">
                    Configure customer support helpline, direct bank payouts, and delivery policies.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-5">
                
                {/* HELPLINE & STORE DETAILS SECTION (User Requested Access) */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-red-700" />
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Customer Support Helpline &amp; Store Contact
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Customer Helpline Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={settingsForm.supportPhone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden focus:border-red-800"
                      />
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        Shown on header top bar, mobile menu &amp; invoice
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Support Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. support@nccuniforms.com"
                        value={settingsForm.supportEmail}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:border-red-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Store / Outfitter Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. NCC Cadet Uniform Outfitters"
                        value={settingsForm.storeName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-hidden focus:border-red-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Owner / Officer Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Capt. V. S. Chauhan"
                        value={settingsForm.ownerName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, ownerName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:outline-hidden focus:border-red-800"
                      />
                    </div>
                  </div>
                </div>

                {/* DIRECT UPI SECTION */}
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                  <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                    Your Personal or Business UPI ID (VPA) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. yourname@sbi or 9876543210@paytm"
                    value={settingsForm.upiId}
                    onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value.trim() })}
                    className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-xs text-stone-900 focus:outline-hidden focus:border-emerald-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.accountHolderName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, accountHolderName: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.bankName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.bankAccountNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankAccountNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Bank IFSC Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.bankIfscCode}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bankIfscCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">Enable Cash on Delivery (COD)</h4>
                      <p className="text-[11px] text-stone-500">Allow cadets to pay cash at delivery</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.codEnabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, codEnabled: e.target.checked })}
                      className="w-5 h-5 rounded text-red-800 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        COD Extra Fee (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={settingsForm.codExtraFee}
                        onChange={(e) => setSettingsForm({ ...settingsForm, codExtraFee: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Free Shipping Min (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={settingsForm.minOrderForFreeShipping}
                        onChange={(e) => setSettingsForm({ ...settingsForm, minOrderForFreeShipping: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Bank Settings</span>
                  </button>

                  {settingsSaved && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Saved!</span>
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Live QR Tester */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <QrCode className="w-4 h-4" />
                <span>Live UPI QR Scanner Preview</span>
              </div>
              <p className="text-xs text-stone-500">
                Scan this QR with your GPay, PhonePe, or Paytm app right now to verify direct bank deposits!
              </p>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block shadow-inner">
                {testQrUrl && (
                  <img src={testQrUrl} alt="UPI QR" className="w-48 h-48 mx-auto rounded-lg shadow-xs" />
                )}
                <span className="text-xs font-black text-stone-900 mt-2 block">{formatINR(testAmount)}</span>
                <span className="text-[10px] text-stone-500 font-mono">{settingsForm.upiId}</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: REVENUE ANALYTICS
           ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-stone-900">Revenue &amp; Payout Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-900 to-stone-900 text-white rounded-3xl p-6 shadow-md">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Direct Bank Settlement
                </span>
                <span className="text-3xl font-black mt-2 block">{formatINR(directBankRevenue)}</span>
                <p className="text-xs text-stone-300 mt-2">
                  Verified deposits credited directly to Account: {settings.bankAccountNumber}
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-900 to-stone-900 text-white rounded-3xl p-6 shadow-md">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  COD Orders Scheduled
                </span>
                <span className="text-3xl font-black mt-2 block">{formatINR(codTotalRevenue)}</span>
                <p className="text-xs text-stone-300 mt-2">
                  Total cash to be collected by India Post / courier at delivery.
                </p>
              </div>

              <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl p-6 shadow-md">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                  Total Business Volume
                </span>
                <span className="text-3xl font-black mt-2 block">
                  {formatINR(directBankRevenue + codTotalRevenue)}
                </span>
                <p className="text-xs text-stone-300 mt-2">Across {orders.length} cadet uniform orders.</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL 1: ADD YOUR OWN STOCK / PRODUCT (WITH PHOTO UPLOAD & PRICE SETUP)
         ========================================================================= */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
          <div 
            className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddProductModal(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 bg-stone-900 text-white rounded-t-3xl border-b border-stone-800">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                <Plus className="w-4 h-4" />
                <span>ADD YOUR OWN UNIFORM INVENTORY</span>
              </div>
              <h2 className="text-xl font-black">
                Add New Product with Custom Photo &amp; Price
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                Upload your own product pictures from your device or paste an image link.
              </p>
            </div>

            <form onSubmit={handleCreateNewProduct} className="p-6 sm:p-8 space-y-5">
              
              {/* PHOTO SELECTION SECTION */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                  Product Photo (Upload or Paste Link) *
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview Box */}
                  <div className="w-28 h-28 rounded-2xl bg-stone-200 border-2 border-dashed border-stone-300 overflow-hidden flex items-center justify-center shrink-0">
                    {newProductForm.imageUrl || newProductImagePreview ? (
                      <img 
                        src={newProductForm.imageUrl || newProductImagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2 text-stone-400">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-[10px] block leading-tight">No Photo Selected</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    {/* Hidden file input */}
                    <input
                      ref={addFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAddPhotoFileChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => addFileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Upload Photo from Device / Camera</span>
                    </button>

                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Or paste image URL (https://...)"
                        value={newProductForm.imageUrl}
                        onChange={(e) => {
                          setNewProductForm({ ...newProductForm, imageUrl: e.target.value });
                          setNewProductImagePreview('');
                        }}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:border-red-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Uniform Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NCC Ceremonial Sash (Red & Gold)"
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden focus:bg-white focus:border-red-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Subtitle / Inspection Specification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Silk embroidered with golden tassels"
                    value={newProductForm.subtitle}
                    onChange={(e) => setNewProductForm({ ...newProductForm, subtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:bg-white focus:border-red-800"
                  />
                </div>
              </div>

              {/* Wing & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Cadet Wing
                  </label>
                  <select
                    value={newProductForm.wing}
                    onChange={(e) => setNewProductForm({ ...newProductForm, wing: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900"
                  >
                    <option value="army">Army Wing</option>
                    <option value="navy">Navy Wing</option>
                    <option value="air">Air Wing</option>
                    <option value="common">Common / All Wings</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Category
                  </label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900"
                  >
                    <option value="shirts_trousers">Shirts &amp; Trousers</option>
                    <option value="uniform_set">Complete Uniform Set</option>
                    <option value="boots">DMS Boots &amp; Shoes</option>
                    <option value="berets_hackles">Berets &amp; Hackles</option>
                    <option value="belts_lanyards">Belts &amp; Lanyards</option>
                    <option value="badges_ranks">Badges &amp; Ranks</option>
                    <option value="drill_accessories">Drill Accessories</option>
                    <option value="camp_pt">Camp &amp; PT Gear</option>
                  </select>
                </div>
              </div>

              {/* Pricing & Stock (User Requested Core Controls) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <label className="text-xs font-bold text-stone-900 block mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-black text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-900 block mb-1">
                    MRP / Original (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 1299"
                    value={newProductForm.originalPrice || ''}
                    onChange={(e) => setNewProductForm({ ...newProductForm, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-semibold text-stone-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-900 block mb-1">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newProductForm.stockCount}
                    onChange={(e) => setNewProductForm({ 
                      ...newProductForm, 
                      stockCount: Number(e.target.value),
                      inStock: Number(e.target.value) > 0
                    })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-bold text-stone-900"
                  />
                </div>
              </div>

              {/* Sizes Available */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Available Sizes (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 36, 38, 40, 42 or UK 6, UK 7, UK 8"
                  value={newProductForm.availableSizes}
                  onChange={(e) => setNewProductForm({ ...newProductForm, availableSizes: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900"
                />
              </div>

              {/* In Stock Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <span className="font-bold text-xs text-stone-900 block">Mark as In Stock immediately</span>
                  <span className="text-[11px] text-stone-500">Cadets can add this item to cart immediately</span>
                </div>
                <input
                  type="checkbox"
                  checked={newProductForm.inStock}
                  onChange={(e) => setNewProductForm({ ...newProductForm, inStock: e.target.checked })}
                  className="w-5 h-5 rounded text-red-800 cursor-pointer"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold cursor-pointer shadow-md"
                >
                  Save &amp; Add to Catalog
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EDIT EXISTING PRODUCT (PHOTO, PRICE, STOCK, SIZES)
         ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
          <div 
            className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                  EDIT ITEM #{editingProduct.id.split('-').pop()}
                </span>
                <h3 className="font-black text-lg text-stone-900">
                  Update Photo, Price &amp; Stock
                </h3>
              </div>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedProduct} className="space-y-4 text-xs">
              
              {/* Photo Edit */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Product Photo</label>
                <div className="flex items-center gap-3">
                  <img
                    src={editingProduct.imageUrl}
                    alt={editingProduct.name}
                    className="w-16 h-16 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleEditPhotoFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-lg bg-stone-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-stone-800"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload New Image File</span>
                    </button>
                    <input
                      type="url"
                      placeholder="Or Image URL"
                      value={editingProduct.imageUrl}
                      onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-xs text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-black text-sm text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-xs text-stone-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Stock Units</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.stockCount}
                    onChange={(e) => setEditingProduct({ 
                      ...editingProduct, 
                      stockCount: Number(e.target.value),
                      inStock: Number(e.target.value) > 0
                    })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">In Stock Status</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.inStock && editingProduct.stockCount > 0}
                      onChange={(e) => setEditingProduct({ 
                        ...editingProduct, 
                        inStock: e.target.checked,
                        stockCount: e.target.checked && editingProduct.stockCount === 0 ? 10 : editingProduct.stockCount
                      })}
                      className="w-4 h-4 rounded text-red-800"
                    />
                    <span className="font-bold text-xs">
                      {editingProduct.inStock && editingProduct.stockCount > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: DISPATCH ORDER
         ========================================================================= */}
      {dispatchOrderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-stone-900">
                Dispatch Order {dispatchOrderTarget.id}
              </h3>
              <button 
                onClick={() => setDispatchOrderTarget(null)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Recipient: <strong>{dispatchOrderTarget.customer.fullName}</strong> ({dispatchOrderTarget.customer.city})
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Courier / Logistics Partner
                </label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900"
                >
                  <option value="Speed Post (India Post)">Speed Post (India Post)</option>
                  <option value="DTDC Express">DTDC Express</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="Blue Dart Express">Blue Dart Express</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Tracking / AWB Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. SP912849102IN"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setDispatchOrderTarget(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                className="px-5 py-2 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
