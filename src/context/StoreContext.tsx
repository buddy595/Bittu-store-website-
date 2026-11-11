import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order, MerchantSettings, OrderStatus, VerifiedCustomer } from '../types';
import { initialProducts } from '../data/initialProducts';
import { defaultMerchantSettings } from '../data/defaultSettings';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  settings: MerchantSettings;
  activeView: 'store' | 'admin' | 'track';
  setActiveView: (view: 'store' | 'admin' | 'track') => void;
  // Customer OTP Verification State
  verifiedCustomer: VerifiedCustomer | null;
  setVerifiedCustomer: (cust: VerifiedCustomer | null) => void;
  logoutCustomer: () => void;
  // Admin Authentication State
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, pass: string) => boolean;
  adminLogout: () => void;
  // Cart Actions
  addToCart: (
    product: Product, 
    size?: string, 
    quantity?: number, 
    cadetName?: string, 
    regimentalNumber?: string, 
    unitBattalion?: string
  ) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => { subtotal: number; discount: number; shipping: number; codFee: number; total: number; totalCount: number };
  // Order Actions
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string, courier?: string, tracking?: string) => void;
  updatePaymentStatus: (orderId: string, status: 'pending' | 'verified' | 'failed' | 'cod_pending', utrNumber?: string) => void;
  submitUtrProof: (orderId: string, utrNumber: string, proofUrl?: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  // Product & Stock Management
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  toggleStockStatus: (productId: string, inStock: boolean) => void;
  updateStockCount: (productId: string, stockCount: number) => void;
  updatePrice: (productId: string, price: number, originalPrice?: number) => void;
  resetCatalogToDefault: () => void;
  // Settings Management
  updateSettings: (newSettings: Partial<MerchantSettings>) => void;
  // Helper
  generateUpiPaymentLink: (amount: number, orderId: string) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Realistic demo orders for quick evaluation
const sampleOrders: Order[] = [
  {
    id: 'NCC-2026-8812',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    customer: {
      fullName: 'Sgt. Rohan Pratap Singh',
      phone: '9823456781',
      email: 'rohan.singh@gmail.com',
      cadetNumber: 'UP/24/SDA/119284',
      battalionUnit: '19 UP BN NCC, Lucknow',
      wing: 'army',
      addressLine: 'Room 204, Cadet Hostel, University Campus',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226007',
      notes: 'Please pack beret with stiff backing plate for parade inspection.'
    },
    items: [
      {
        product: initialProducts[0], // Complete kit
        selectedSize: '38 (M)',
        quantity: 1,
        cadetName: 'ROHAN P. SINGH',
        regimentalNumber: 'UP/24/SDA/119284',
        unitBattalion: '19 UP BN NCC'
      }
    ],
    subtotal: 2499,
    discount: 0,
    shipping: 0,
    codFee: 0,
    totalAmount: 2499,
    paymentMethod: 'upi',
    paymentStatus: 'verified',
    orderStatus: 'processing',
    utrNumber: '412984719283',
    adminNotes: 'Direct bank transfer verified in SBI Cantonment Account. Packing for dispatch.'
  },
  {
    id: 'NCC-2026-8813',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customer: {
      fullName: 'Cadet Ananya Deshmukh',
      phone: '9421098765',
      email: 'ananya.deshmukh@rediffmail.com',
      cadetNumber: 'MAH/24/SWA/229104',
      battalionUnit: '1 MAH Naval Unit NCC, Mumbai',
      wing: 'navy',
      addressLine: 'Flat 4B, Samudra Enclave, Worli Sea Face',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400030'
    },
    items: [
      {
        product: initialProducts[2], // Navy white uniform
        selectedSize: '36',
        quantity: 1,
        cadetName: 'ANANYA DESHMUKH',
        regimentalNumber: 'MAH/24/SWA/229104',
        unitBattalion: '1 MAH NAVAL'
      },
      {
        product: initialProducts[6], // Navy beret
        selectedSize: '7.0 inch (Medium)',
        quantity: 1
      }
    ],
    subtotal: 1648,
    discount: 0,
    shipping: 0,
    codFee: 49,
    totalAmount: 1697,
    paymentMethod: 'cod',
    paymentStatus: 'cod_pending',
    orderStatus: 'pending_payment',
    adminNotes: 'Cash on delivery verified via phone call. Scheduled for dispatch tomorrow morning.'
  },
  {
    id: 'NCC-2026-8814',
    createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    customer: {
      fullName: 'Cadet Vikram Rathore',
      phone: '9784561230',
      email: 'vikram.rathore.ncc@gmail.com',
      cadetNumber: 'RAJ/24/SDA/330198',
      battalionUnit: '1 RAJ AIR SQN NCC, Jaipur',
      wing: 'air',
      addressLine: 'Plot 12, Air Force Road, Vidyadhar Nagar',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302039'
    },
    items: [
      {
        product: initialProducts[3], // Air wing uniform
        selectedSize: '40',
        quantity: 1,
        cadetName: 'VIKRAM RATHORE',
        regimentalNumber: 'RAJ/24/SDA/330198',
        unitBattalion: '1 RAJ AIR SQN'
      },
      {
        product: initialProducts[4], // DMS Boots
        selectedSize: 'UK 8',
        quantity: 1
      }
    ],
    subtotal: 2248,
    discount: 0,
    shipping: 0,
    codFee: 0,
    totalAmount: 2248,
    paymentMethod: 'upi',
    paymentStatus: 'pending',
    orderStatus: 'pending_payment',
    utrNumber: '509124819021',
    adminNotes: 'Customer submitted UTR #509124819021. Check bank statement and approve.'
  }
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load products from localStorage or default
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('ncc_store_products');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading products from localStorage', e);
    }
    return initialProducts;
  });

  // Load cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ncc_store_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading cart from localStorage', e);
    }
    return [];
  });

  // Load orders from localStorage or sample
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('ncc_store_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading orders from localStorage', e);
    }
    return sampleOrders;
  });

  // Load merchant settings
  const [settings, setSettings] = useState<MerchantSettings>(() => {
    try {
      const saved = localStorage.getItem('ncc_merchant_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
    }
    return defaultMerchantSettings;
  });

  // Active view: 'store' | 'admin' | 'track'
  const [activeView, setActiveView] = useState<'store' | 'admin' | 'track'>('store');

  // Customer Verification (Mobile + OTP)
  const [verifiedCustomer, setVerifiedCustomer] = useState<VerifiedCustomer | null>(() => {
    try {
      const saved = localStorage.getItem('ncc_verified_cadet');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading verified customer', e);
    }
    return null;
  });

  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ncc_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem('ncc_store_products', JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('ncc_store_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('ncc_store_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving orders', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('ncc_merchant_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      if (verifiedCustomer) {
        localStorage.setItem('ncc_verified_cadet', JSON.stringify(verifiedCustomer));
      } else {
        localStorage.removeItem('ncc_verified_cadet');
      }
    } catch (e) {
      console.error('Error saving customer verification', e);
    }
  }, [verifiedCustomer]);

  useEffect(() => {
    try {
      localStorage.setItem('ncc_admin_auth', isAdminAuthenticated ? 'true' : 'false');
    } catch (e) {
      console.error('Error saving admin auth', e);
    }
  }, [isAdminAuthenticated]);

  // Admin login logic
  const adminLogin = (email: string, pass: string): boolean => {
    const validUsername = '#@123';
    const validPassword = '&123&6565';

    const inputUser = email.trim();
    const inputPass = pass.trim();

    if (
      inputUser === validUsername &&
      inputPass === validPassword
    ) {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    setActiveView('store');
  };

  const logoutCustomer = () => {
    setVerifiedCustomer(null);
    try {
      localStorage.removeItem('ncc_verified_cadet');
    } catch (e) {
      console.error('Error removing customer verification', e);
    }
  };

  // Cart operations
  const addToCart = (
    product: Product, 
    size?: string, 
    quantity = 1, 
    cadetName?: string, 
    regimentalNumber?: string, 
    unitBattalion?: string
  ) => {
    setCart(prevCart => {
      // Find if item already exists with matching size and customization
      const existingIndex = prevCart.findIndex(
        item => 
          item.product.id === product.id && 
          item.selectedSize === size &&
          item.cadetName === cadetName &&
          item.regimentalNumber === regimentalNumber
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prevCart, 
        { product, selectedSize: size, quantity, cadetName, regimentalNumber, unitBattalion }
      ];
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity };
      return updated;
    });
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    
    // Free shipping threshold
    const shipping = subtotal >= settings.minOrderForFreeShipping || subtotal === 0 ? 0 : settings.standardShippingFee;
    const discount = 0;
    const codFee = 0;
    const total = subtotal - discount + shipping;

    return { subtotal, discount, shipping, codFee, total, totalCount };
  };

  // Order operations
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...orderData,
      id: `NCC-${new Date().getFullYear()}-${randomSuffix}`,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string, 
    status: OrderStatus, 
    notes?: string, 
    courier?: string, 
    tracking?: string
  ) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: status,
          adminNotes: notes !== undefined ? notes : o.adminNotes,
          courierName: courier !== undefined ? courier : o.courierName,
          trackingNumber: tracking !== undefined ? tracking : o.trackingNumber,
          paymentStatus: status === 'delivered' && o.paymentMethod === 'cod' ? 'verified' : o.paymentStatus
        };
      }
      return o;
    }));
  };

  const updatePaymentStatus = (
    orderId: string, 
    status: 'pending' | 'verified' | 'failed' | 'cod_pending', 
    utrNumber?: string
  ) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paymentStatus: status,
          utrNumber: utrNumber || o.utrNumber,
          orderStatus: status === 'verified' && o.orderStatus === 'pending_payment' ? 'payment_verified' : o.orderStatus
        };
      }
      return o;
    }));
  };

  const submitUtrProof = (orderId: string, utrNumber: string, proofUrl?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          utrNumber,
          paymentProofUrl: proofUrl || o.paymentProofUrl,
          orderStatus: o.orderStatus === 'pending_payment' ? 'pending_payment' : o.orderStatus
        };
      }
      return o;
    }));
  };

  const getOrderById = (orderId: string) => {
    return orders.find(
      o => o.id.toLowerCase() === orderId.trim().toLowerCase() || 
           o.customer.phone === orderId.trim()
    );
  };

  // Product & Stock operations
  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updated = { ...p, ...updates };
        const validStock = typeof updated.stockCount === 'number' && Number.isFinite(updated.stockCount)
          ? Math.max(0, Math.floor(updated.stockCount))
          : 0;
        return {
          ...updated,
          stockCount: validStock,
          inStock: updated.inStock !== undefined ? updated.inStock : validStock > 0
        };
      }
      return p;
    }));
  };

  const toggleStockStatus = (productId: string, inStock: boolean) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const currentCount = typeof p.stockCount === 'number' && Number.isFinite(p.stockCount) ? p.stockCount : 0;
        const newCount = inStock ? (currentCount > 0 ? currentCount : 15) : 0;
        return {
          ...p,
          inStock: inStock && newCount > 0,
          stockCount: newCount
        };
      }
      return p;
    }));
  };

  const updateStockCount = (productId: string, stockCount: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const validCount = Number.isFinite(stockCount) ? Math.max(0, Math.floor(stockCount)) : 0;
        return {
          ...p,
          stockCount: validCount,
          inStock: validCount > 0
        };
      }
      return p;
    }));
  };

  const updatePrice = (productId: string, price: number, originalPrice?: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const validPrice = Number.isFinite(price) && price > 0 ? Math.floor(price) : p.price;
        const validOriginal = originalPrice !== undefined && Number.isFinite(originalPrice) 
          ? Math.floor(originalPrice) 
          : p.originalPrice;
        return {
          ...p,
          price: validPrice,
          originalPrice: validOriginal
        };
      }
      return p;
    }));
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const resetCatalogToDefault = () => {
    setProducts(initialProducts);
    localStorage.removeItem('ncc_store_products');
  };

  // Settings
  const updateSettings = (newSettings: Partial<MerchantSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Direct Bank UPI generator:
  // Format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
  const generateUpiPaymentLink = (amount: number, orderId: string) => {
    const encodedName = encodeURIComponent(settings.accountHolderName || settings.storeName);
    const encodedNote = encodeURIComponent(`NCC Uniforms Order ${orderId}`);
    return `upi://pay?pa=${settings.upiId}&pn=${encodedName}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}`;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        orders,
        settings,
        activeView,
        setActiveView,
        verifiedCustomer,
        setVerifiedCustomer,
        logoutCustomer,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        submitUtrProof,
        getOrderById,
        updateProduct,
        addProduct,
        deleteProduct,
        toggleStockStatus,
        updateStockCount,
        updatePrice,
        resetCatalogToDefault,
        updateSettings,
        generateUpiPaymentLink
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
