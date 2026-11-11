import React, { useState } from 'react';
import { 
  X, 
  User, 
  Package, 
  PhoneCall, 
  ShieldCheck, 
  ChevronRight, 
  CreditCard, 
  Compass, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  Phone,
  LogOut,
  AlertTriangle,
  Check
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrders: () => void;
  onOpenVerification: () => void;
  onOpenSizeGuide: () => void;
  onOpenKitBuilder: () => void;
  onOpenAdminLogin: () => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  onOpenOrders,
  onOpenVerification,
  onOpenSizeGuide,
  onOpenKitBuilder,
  onOpenAdminLogin
}) => {
  const { verifiedCustomer, logoutCustomer, settings, orders, isAdminAuthenticated } = useStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutSuccessMessage, setLogoutSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    const cadetName = verifiedCustomer?.cadetName || verifiedCustomer?.phone || 'Cadet';
    logoutCustomer();
    setShowLogoutConfirm(false);
    setLogoutSuccessMessage(`Successfully logged out (${cadetName}). You are now browsing as Guest.`);
    setTimeout(() => {
      setLogoutSuccessMessage(null);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-center items-end sm:items-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal / Sheet Container */}
      <div className="relative w-full max-w-lg bg-stone-100 sm:rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-200">
        
        {/* Header - Military Cadet Theme */}
        <div className="bg-gradient-to-r from-stone-950 via-red-950 to-stone-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-red-900/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-900/60 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  {verifiedCustomer?.cadetName || (verifiedCustomer ? `Cadet (${verifiedCustomer.phone.slice(-4)})` : 'Cadet Customer')}
                </h3>
                <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5 shrink-0">
                  <Sparkles className="w-2.5 h-2.5 fill-current" />
                  <span>Cadet ID</span>
                </span>
              </div>
              <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                {verifiedCustomer ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>+91 {verifiedCustomer.phone} (Verified)</span>
                  </>
                ) : (
                  <span>Guest Cadet • Tap to Verify Mobile</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Logout Button in Header when verified */}
            {verifiedCustomer && (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800 text-red-200 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-red-700/60"
                title="Log out of verified cadet account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Log Out</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Logout Success Toast Alert */}
        {logoutSuccessMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 flex items-center gap-2 text-xs font-bold text-emerald-900 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{logoutSuccessMessage}</span>
          </div>
        )}

        {/* Logout Confirmation Prompt */}
        {showLogoutConfirm && (
          <div className="bg-red-50 border-b border-red-200 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-red-100 text-red-800 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <h4 className="font-extrabold text-stone-900 text-sm">
                  Log out from Cadet Account?
                </h4>
                <p className="text-stone-600 mt-0.5">
                  You are currently logged in with mobile <strong className="text-stone-900 font-mono">+91 {verifiedCustomer?.phone}</strong>. Logging out will clear your saved session on this device.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-4 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Confirm Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Verification Prompt if not verified */}
        {!verifiedCustomer && (
          <div className="bg-amber-50 border-b border-amber-200 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-900 rounded-xl shrink-0">
                <Phone className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Verify Mobile with OTP</h4>
                <p className="text-[11px] text-stone-600">Get faster checkout &amp; order updates</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenVerification();
              }}
              className="px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold text-xs cursor-pointer shadow-xs whitespace-nowrap"
            >
              Verify OTP
            </button>
          </div>
        )}

        {/* Scrollable Customer Menu */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-stone-200/70">
          
          {/* Section 1: Orders & Delivery */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-1">
              My Orders &amp; Activity
            </span>

            <button
              onClick={() => {
                onClose();
                onOpenOrders();
              }}
              className="w-full bg-white hover:bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-50 text-red-800">
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-red-800 transition-colors">
                    Orders &amp; Tracking
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Track delivery status, view invoices &amp; order history
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {orders.length > 0 && (
                  <span className="bg-red-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {orders.length}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </div>
            </button>
          </div>

          {/* Section 2: Cadet Profile & Logout Area (when logged in) */}
          {verifiedCustomer && (
            <div className="pt-3 space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-1">
                Account &amp; Session Management
              </span>

              <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">
                        {verifiedCustomer.cadetName || 'Verified Cadet Customer'}
                      </h4>
                      <p className="text-[11px] font-mono text-stone-600">
                        +91 {verifiedCustomer.phone}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-800 border border-stone-300 hover:border-red-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-600" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Cadet Gear & Sizing */}
          <div className="pt-3 space-y-1">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-1">
              Cadet Gear &amp; Sizing
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenKitBuilder();
                }}
                className="bg-white hover:bg-stone-50 p-3 rounded-xl border border-stone-200 text-left transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700 w-fit mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Parade Kit Builder</h4>
                  <span className="text-[10px] text-amber-700 font-bold">Save ₹700 on 8-pcs</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenSizeGuide();
                }}
                className="bg-white hover:bg-stone-50 p-3 rounded-xl border border-stone-200 text-left transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div className="p-2 rounded-lg bg-stone-100 text-stone-700 w-fit mb-2">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">DG NCC Size Guide</h4>
                  <span className="text-[10px] text-stone-500">Boots, Berets, Shirts</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 4: Customer Support & Direct Bank */}
          <div className="pt-3 space-y-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-1">
              Customer Support &amp; Direct Bank
            </span>

            <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">24x7 Customer Helpline</h4>
                    <p className="text-[11px] text-stone-500">Direct phone support for orders &amp; sizing</p>
                  </div>
                </div>
                <a
                  href={`tel:${settings.supportPhone}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs whitespace-nowrap"
                >
                  Call Now
                </a>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Helpline Number:</span>
                <span className="font-extrabold text-red-800">{settings.supportPhone}</span>
              </div>
            </div>

            {/* Direct Bank Account Info card */}
            <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-stone-900 font-bold">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>Direct Bank Transfer &amp; UPI Details</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Payment deposits directly into seller account with zero gateway surcharge.
              </p>
              <div className="bg-stone-50 p-2 rounded-lg font-mono text-[11px] text-stone-700 flex justify-between items-center">
                <span>UPI ID: <strong>{settings.upiId}</strong></span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Zero Fee</span>
              </div>
            </div>
          </div>

          {/* Section 5: Store Admin / Seller Access */}
          <div className="pt-3 pb-1">
            <div className="bg-stone-200/60 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-stone-600" />
                <div>
                  <h4 className="text-xs font-bold text-stone-800">
                    {isAdminAuthenticated ? 'Admin Dashboard (Active)' : 'Store Owner / Seller Access'}
                  </h4>
                  <p className="text-[10px] text-stone-500">Manage products, stock &amp; orders</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminLogin();
                }}
                className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] cursor-pointer"
              >
                {isAdminAuthenticated ? 'Open Admin' : 'Admin Login'}
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-200/50 border-t border-stone-200 text-center text-[11px] text-stone-500 font-semibold">
          National Cadet Corps • Ekta aur Anushasan
        </div>

      </div>
    </div>
  );
};
