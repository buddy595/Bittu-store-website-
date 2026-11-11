import { MerchantSettings } from '../types';

export const defaultMerchantSettings: MerchantSettings = {
  storeName: "National Cadet Corps (NCC) Official Outfitters",
  ownerName: "Capt. (Retd.) V. S. Chauhan",
  supportPhone: "+91 98765 43210",
  supportEmail: "cadetuniforms.orders@gmail.com",
  // Direct Bank Account & UPI Settings (Direct to Bank)
  upiId: "nccuniforms@sbi",
  accountHolderName: "NATIONAL CADET UNIFORM SUPPLIERS",
  bankAccountNumber: "389201004812",
  bankIfscCode: "SBIN0001452",
  bankName: "State Bank of India (SBI)",
  bankBranch: "Cantonment Main Branch",
  // Payment policies
  codEnabled: true,
  codExtraFee: 49,
  minOrderForFreeShipping: 1499,
  standardShippingFee: 79,
  whatsappOrderAlerts: true,
  sellerWhatsAppNumber: "919876543210",
  banners: {
    heroBadge: "National Cadet Corps Authorized Specification",
    heroTitle: "Official Uniforms, DMS Boots & Drill Gear for Cadets",
    heroSubtitle: "Equip yourself for CATC, ATC camps, and Republic Day Parade selections. Authentic drill-weight fabrics, iron-heel DMS boots, woolen berets, brass crests, and custom-engraved nameplates.",
    heroCtaText: "Build All-In-One Cadet Kit (Save ₹700)",
    promoBadge: "Turnkey Solution for Senior & Junior Cadets",
    promoTitle: "Need a full uniform with boots, beret, belt & customized name plate?",
    promoSubtitle: "Save ₹700 when you order the complete 8-piece All-In-One Parade Kit. Laser-engraved brass nameplate included at zero extra cost.",
    promoDiscountText: "Save ₹700",
    promoCtaText: "Launch Kit Customizer (Save ₹700)"
  }
};
