export interface WhatsAppOrderDetails {
  id: number;
  name: string;
  phone: string;
  total: number;
  address: string;
  items: Array<{ name: string; quantity: number }>;
}

export const useWhatsAppOrder = () => {
  const config = useRuntimeConfig();
  const whatsappNumber = (config.public.whatsappNumber as string || '212').replace(/\D/g, '');

  const generateMessage = (data: WhatsAppOrderDetails) => {
    const productsList = data.items
      .map(item => `* ${item.name} x${item.quantity}`)
      .join('\n');

    const message = `Salam 👋\n\n` +
      `Bghit n2akd talab dyali:\n\n` +
      `🧾 Order ID: ${data.id}\n` +
      `👤 Smia: ${data.name}\n` +
      `📞 Téléphone: ${data.phone}\n\n` +
      `🛒 Products:\n${productsList}\n\n` +
      `💰 Total: ${data.total.toFixed(2)} MAD\n` +
      `📍 Address: ${data.address}\n\n` +
      `Chokran 🙏`;

    return message;
  };

  const getWhatsAppUrl = (data: WhatsAppOrderDetails) => {
    const text = encodeURIComponent(generateMessage(data));
    const isMobile = /iPhone|Android/i.test(navigator.userAgent);
    const baseUrl = isMobile ? 'https://wa.me' : 'https://web.whatsapp.com/send';
    
    return `${baseUrl}/${whatsappNumber}?text=${text}`;
  };

  return {
    generateMessage,
    getWhatsAppUrl
  };
};
