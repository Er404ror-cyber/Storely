// src/hooks/useWhatsAppOrder.ts
import { useCallback } from 'react';
import { useTranslate } from '../context/LanguageContext';
import { toast } from 'react-hot-toast';

interface WhatsAppOrderParams {
  storeName?: string;
  whatsappNumber?: string | null;
  productName: string;
  quantity: number;
  unit: string;
  totalPrice: string; // Já formatado
  customNote: string;
  imageUrl: string; 
}

export function useWhatsAppOrder() {
  const { language } = useTranslate();

  const sendWhatsAppOrder = useCallback(({
    storeName,
    whatsappNumber,
    productName,
    quantity,
    unit,
    totalPrice,
    customNote,
    imageUrl
  }: WhatsAppOrderParams) => {
    
    if (!whatsappNumber) {
      toast.error(language === 'pt' ? 'WhatsApp indisponível.' : 'WhatsApp unavailable.');
      return;
    }

    const cleanNumber = whatsappNumber.replace(/\D/g, "");
    const store = storeName || "Storely";
    const note = customNote.trim();

    let message = "";

    // 💡 TRUQUE DE CONVERSÃO E RENDERIZAÇÃO:
    // 1. Texto muito mais curto e direto.
    // 2. O URL da imagem fica no FINAL e numa linha isolada. 
    // Isso força o WhatsApp a ler o link do Cloudinary e gerar a pré-visualização da foto nativamente.

    if (language === 'pt') {
      message = `Olá! 👋 Quero encomendar na *${store}*:\n\n` +
                `🛍️ *${productName}*\n` +
                `🔢 Qtd: ${quantity} ${unit}\n` +
                `💰 Total: ${totalPrice}\n` +
                (note ? `💬 Nota: "${note}"\n` : "") +
                `\n👇 Foto do produto:\n${imageUrl}`; // <-- URL isolada no fim
    } else {
      message = `Hi! 👋 I'd like to order from *${store}*:\n\n` +
                `🛍️ *${productName}*\n` +
                `🔢 Qty: ${quantity} ${unit}\n` +
                `💰 Total: ${totalPrice}\n` +
                (note ? `💬 Note: "${note}"\n` : "") +
                `\n👇 Product photo:\n${imageUrl}`; // <-- URL isolada no fim
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, "_blank");
    
  }, [language]);

  return { sendWhatsAppOrder };
}