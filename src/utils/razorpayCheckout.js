import env from '../config/env';

function loadRazorpayScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Razorpay unavailable'));
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout({ order, userProfile, onSuccess, onFailure }) {
  const Razorpay = await loadRazorpayScript();
  const options = {
    key: order.keyId || env.razorpayKey,
    amount: order.amountPaise,
    currency: order.currency || 'INR',
    name: 'TurfMate',
    description: 'Turf booking payment',
    order_id: order.razorpayOrderId,
    prefill: {
      name: userProfile?.name || '',
      contact: userProfile?.phone || '',
    },
    theme: { color: '#16a34a' },
    handler: (response) => {
      onSuccess?.({
        orderId: order.orderId,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
    },
    modal: {
      ondismiss: () => onFailure?.(new Error('Payment cancelled')),
    },
  };

  const rzp = new Razorpay(options);
  rzp.on('payment.failed', (response) => {
    onFailure?.(new Error(response.error?.description || 'Payment failed'));
  });
  rzp.open();
}

export default openRazorpayCheckout;
