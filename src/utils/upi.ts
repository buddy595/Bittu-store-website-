import QRCode from 'qrcode';

export interface UpiUriParams {
  upiId: string;
  payeeName: string;
  amount: number;
  orderId: string;
  note?: string;
}

/**
 * Generates standard Indian National Payments Corporation of India (NPCI) UPI URI
 * Example: upi://pay?pa=seller@bank&pn=Merchant%20Name&am=1250.00&cu=INR&tn=Order%20NCC-2026-1024
 */
export function buildUpiUri(params: UpiUriParams): string {
  const { upiId, payeeName, amount, orderId, note } = params;
  const cleanUpiId = (upiId || '').trim();
  const encodedName = encodeURIComponent((payeeName || 'NCC Uniforms').trim());
  const encodedNote = encodeURIComponent(note || `NCC Uniform Order ${orderId}`);
  const formattedAmount = (amount || 0).toFixed(2);

  return `upi://pay?pa=${cleanUpiId}&pn=${encodedName}&am=${formattedAmount}&cu=INR&tn=${encodedNote}`;
}

/**
 * Generates app-specific intent URIs for leading Indian mobile payment apps
 */
export function buildAppUpiUri(app: 'phonepe' | 'gpay' | 'paytm' | 'bhim' | 'universal', params: UpiUriParams): string {
  const standardUri = buildUpiUri(params);
  const baseQuery = standardUri.replace('upi://pay?', '');

  switch (app) {
    case 'phonepe':
      return `phonepe://pay?${baseQuery}`;
    case 'gpay':
      return `gpay://upi/pay?${baseQuery}`;
    case 'paytm':
      return `paytmmp://pay?${baseQuery}`;
    case 'bhim':
      return `upi://pay?${baseQuery}`;
    case 'universal':
    default:
      return standardUri;
  }
}

/**
 * Generates data URL for QR Code using qrcode library
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

/**
 * Currency formatter for Indian Rupees (₹)
 */
export function formatINR(amount: number): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(safeAmount);
}
