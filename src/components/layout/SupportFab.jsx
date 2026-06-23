import { MessageCircle } from 'lucide-react';
import env from '../../config/env';
import { openSupportWhatsApp } from '../../utils/support';

export default function SupportFab() {
  if (!env.supportWhatsApp) return null;

  return (
    <button
      type="button"
      onClick={() => openSupportWhatsApp()}
      className="fixed bottom-[88px] right-4 lg:bottom-6 lg:right-6 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      aria-label="WhatsApp support"
      title="Chat with support"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
