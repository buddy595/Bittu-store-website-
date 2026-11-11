export type WingType = 'all' | 'army' | 'navy' | 'air' | 'common';

export type ProductCategory = 
  | 'uniform_set'
  | 'shirts_trousers'
  | 'boots'
  | 'berets_hackles'
  | 'belts_lanyards'
  | 'badges_ranks'
  | 'drill_accessories'
  | 'camp_pt';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  wing: WingType;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  description: string;
  features: string[];
  inStock: boolean;
  stockCount: number;
  availableSizes?: string[];
  isCustomizable?: boolean; // e.g. engraved name tag, regimental embroidery
  badgeOrRank?: string;
  drillRegulationNote?: string;
}

export interface CartItem {
  product: Product;
  selectedSize?: string;
  quantity: number;
  cadetName?: string;
  regimentalNumber?: string;
  unitBattalion?: string;
}

export type PaymentMethod = 'upi' | 'bank_transfer' | 'cod';

export type OrderStatus = 
  | 'pending_payment'
  | 'payment_verified'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export interface CustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  cadetNumber?: string;
  battalionUnit: string;
  wing: 'army' | 'navy' | 'air';
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  codFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'verified' | 'failed' | 'cod_pending';
  orderStatus: OrderStatus;
  utrNumber?: string;
  paymentProofUrl?: string;
  courierName?: string;
  trackingNumber?: string;
  adminNotes?: string;
}

export interface MerchantSettings {
  storeName: string;
  ownerName: string;
  supportPhone: string;
  supportEmail: string;
  // Direct Bank Payment Settings
  upiId: string; // e.g. "nccstore@icici" or "9876543210@paytm"
  accountHolderName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankName: string;
  bankBranch: string;
  // COD settings
  codEnabled: boolean;
  codExtraFee: number; // e.g. 50 or 0
  minOrderForFreeShipping: number;
  standardShippingFee: number;
  whatsappOrderAlerts: boolean;
  sellerWhatsAppNumber: string;
  // Editable Banners (User Requested)
  banners?: BannerSettings;
}

export interface BannerSettings {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  promoBadge: string;
  promoTitle: string;
  promoSubtitle: string;
  promoDiscountText: string;
  promoCtaText: string;
}

export interface VerifiedCustomer {
  phone: string;
  verifiedAt: string;
  cadetName?: string;
}
