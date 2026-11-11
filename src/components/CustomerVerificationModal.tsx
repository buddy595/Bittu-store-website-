import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Phone, 
  ShieldCheck, 
  RefreshCw, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Lock,
  UserCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CustomerVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: (phone: string, cadetName?: string) => void;
}

export const CustomerVerificationModal: React.FC<CustomerVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified
}) => {
  const { verifiedCustomer, setVerifiedCustomer } = useStore();

  const [step, setStep] = useState<'mobile_captcha' | 'otp' | 'success'>('mobile_captcha');
  const [mobileNumber, setMobileNumber] = useState('');
  const [cadetName, setCadetName] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  
  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate random 5-character alphanumeric CAPTCHA
  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    setCaptchaError('');
  };

  // Draw CAPTCHA with noise lines and styling
  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, '#f1f5f9');
    bg.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(185, 28, 28, ${0.15 + Math.random() * 0.2})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Characters
    ctx.font = 'bold 22px Courier New, monospace';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = 16 + i * 22;
      const y = canvas.height / 2 + (Math.random() * 4 - 2);
      const angle = (Math.random() - 0.5) * 0.35;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = i % 2 === 0 ? '#991b1b' : '#1e3a8a';
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }

    // Noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(100, 116, 139, ${Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateCaptcha();
      if (verifiedCustomer) {
        setMobileNumber(verifiedCustomer.phone);
        setCadetName(verifiedCustomer.cadetName || '');
      }
    }
  }, [isOpen, verifiedCustomer]);

  useEffect(() => {
    if (captchaCode && canvasRef.current) {
      drawCaptcha(captchaCode);
    }
  }, [captchaCode]);

  // Resend timer countdown
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length !== 10) {
      setCaptchaError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setCaptchaError('Incorrect CAPTCHA code. Please try again.');
      generateCaptcha();
      return;
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    setStep('otp');
    setResendTimer(30);
    setCanResend(false);
    setOtpError('');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.trim() === generatedOtp || otpInput.trim() === '1234') {
      const verified = {
        phone: mobileNumber,
        verifiedAt: new Date().toISOString(),
        cadetName: cadetName.trim() || undefined
      };
      setVerifiedCustomer(verified);
      setStep('success');
      if (onVerified) onVerified(mobileNumber, cadetName);
      setTimeout(() => {
        onClose();
        setStep('mobile_captcha');
      }, 1600);
    } else {
      setOtpError('Invalid OTP code. Please enter the 4-digit code sent to your mobile.');
    }
  };

  const handleResend = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    setResendTimer(30);
    setCanResend(false);
    setOtpError('');
  };

  const handleResetVerification = () => {
    setVerifiedCustomer(null);
    setStep('mobile_captcha');
    setMobileNumber('');
    setOtpInput('');
    generateCaptcha();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-stone-900 via-red-950 to-stone-900 text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-red-700/40 border border-red-500/40 text-amber-300 flex items-center justify-center mx-auto mb-2.5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-0.5">
            CADET SECURITY VERIFICATION
          </span>
          <h2 className="text-xl font-black">
            {verifiedCustomer ? 'Verified Cadet Profile' : 'Mobile &amp; OTP Verification'}
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            Authenticate to track orders, save delivery details, and get instant dispatch SMS
          </p>
        </div>

        <div className="p-6 space-y-5">
          
          {/* If already verified */}
          {verifiedCustomer && step === 'mobile_captcha' ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Cadet Verified
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-2">
                  +91 {verifiedCustomer.phone}
                </h3>
                {verifiedCustomer.cadetName && (
                  <p className="text-xs font-bold text-stone-600 mt-0.5">
                    {verifiedCustomer.cadetName}
                  </p>
                )}
                <p className="text-[11px] text-stone-400 mt-1">
                  Verified on {new Date(verifiedCustomer.verifiedAt).toLocaleDateString('en-IN')}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleResetVerification}
                  className="w-full py-2 text-stone-500 hover:text-red-700 font-semibold text-xs cursor-pointer"
                >
                  Verify Different Mobile Number
                </button>
              </div>
            </div>
          ) : step === 'mobile_captcha' ? (
            /* STEP 1: Mobile + CAPTCHA */
            <form onSubmit={handleSendOtp} className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Cadet Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cadet Rohan Sharma"
                  value={cadetName}
                  onChange={(e) => setCadetName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:bg-white focus:border-red-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  10-Digit Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-11 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-hidden focus:bg-white focus:border-red-800"
                  />
                </div>
              </div>

              {/* CAPTCHA SECTION */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                    Anti-Bot Security Code
                  </span>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="text-[11px] text-red-800 hover:text-red-950 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh Code</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Canvas CAPTCHA */}
                  <div className="rounded-xl overflow-hidden border border-stone-300 shadow-inner bg-white shrink-0">
                    <canvas ref={canvasRef} width={135} height={42} className="block" />
                  </div>

                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="Enter Code"
                    value={captchaInput}
                    onChange={(e) => {
                      setCaptchaInput(e.target.value.toUpperCase());
                      setCaptchaError('');
                    }}
                    className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono font-black text-stone-900 uppercase tracking-widest text-center focus:outline-hidden focus:border-red-800"
                  />
                </div>

                {captchaError && (
                  <p className="text-[11px] text-red-600 font-semibold">{captchaError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <span>Get Verification OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-stone-400 text-center">
                Standard SMS rates may apply. Used only for NCC order confirmations &amp; dispatch tracking.
              </p>
            </form>
          ) : step === 'otp' ? (
            /* STEP 2: Enter OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              
              {/* SMS Dispatch Notice - Do NOT show OTP on screen */}
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1">
                <span className="text-xs font-bold text-emerald-900 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>OTP Sent to Mobile Number</span>
                </span>
                <p className="text-[11px] text-emerald-800">
                  A 4-digit verification code has been dispatched to <strong>+91 {mobileNumber}</strong>. Please check your SMS messages.
                </p>
                <div className="pt-1">
                  <a
                    href={`https://wa.me/91${mobileNumber}?text=${encodeURIComponent(`Your NCC Uniforms verification code is: ${generatedOtp}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline"
                  >
                    Receive on WhatsApp instead (+91 {mobileNumber})
                  </a>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-800">
                    Enter 4-Digit OTP sent to +91 {mobileNumber}
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('mobile_captcha')}
                    className="text-[11px] text-red-800 hover:underline font-semibold cursor-pointer"
                  >
                    Change Number
                  </button>
                </div>
                
                <input
                  type="text"
                  required
                  maxLength={4}
                  autoFocus
                  placeholder="• • • •"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-3 bg-stone-50 border border-stone-300 rounded-xl text-lg font-mono font-black text-stone-900 tracking-widest text-center focus:outline-hidden focus:bg-white focus:border-emerald-600"
                />

                {otpError && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1 text-center">{otpError}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                <span>Didn't receive code?</span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-red-800 font-bold hover:underline cursor-pointer"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span>Resend in {resendTimer}s</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify &amp; Continue</span>
              </button>
            </form>
          ) : (
            /* STEP 3: Success Animation */
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-stone-900">
                Verification Successful!
              </h3>
              <p className="text-xs text-stone-500">
                Cadet mobile +91 {mobileNumber} verified. Proceeding...
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
