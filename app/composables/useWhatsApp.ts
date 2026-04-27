export interface WhatsAppOrderData {
  orderId: number;
  customerName: string;
  phone: string;
  address: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

export const generateWhatsAppMessage = (data: WhatsAppOrderData): string => {
  const itemsList = data.items
    .map((item) => `• ${item.name} (x${item.quantity})`)
    .join('\n');

  const message = `🌟 *NEW ORDER CONFIRMATION* 🌟\n\n` +
    `📍 *Order ID:* #${data.orderId}\n` +
    `👤 *Customer:* ${data.customerName}\n` +
    `📞 *Phone:* ${data.phone}\n` +
    `🏠 *Address:* ${data.address}\n\n` +
    `🛒 *Items:* \n${itemsList}\n\n` +
    `💰 *Total Amount:* ${data.total.toFixed(2)} DH\n\n` +
    `🚀 *Please confirm this order for delivery in Marrakech.*`;

  return encodeURIComponent(message);
};

export const useWhatsApp = () => {
  const config = useRuntimeConfig();
  const whatsappNumber = config.public.whatsappNumber || '212';

  const redirectToWhatsApp = (data: WhatsAppOrderData) => {
    const encodedText = generateWhatsAppMessage(data);
    const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodedText}`;
    window.open(url, '_blank');
  };

  return {
    redirectToWhatsApp
  };
};
