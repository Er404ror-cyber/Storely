<div align="center">

# 🚀 Storely — No Code / No Limits

**The ultimate platform for high-performance, real-time website and store building.**  
*A plataforma definitiva para criar sites e lojas online com performance extrema.*

</div>

---

## 📌 About / Sobre o Projeto

**Storely** is a modern, high-performance, no-code web platform built for speed, efficiency, and exceptional user experience. Designed to run smoothly even on lower-end devices, it empowers users to deploy professional digital storefronts and landing pages in real-time.

*O **Storely** é uma plataforma web moderna, desenvolvida sem código (no-code), focada em velocidade, eficiência e experiência de usuário excepcional. Projetado para rodar com fluidez extrema (mesmo em dispositivos mais fracos ou legados), o Storely permite a criação e publicação de lojas virtuais e landing pages profissionais em tempo real.*

---

## ✨ Key Features / Funcionalidades Principais

* **🚀 Extreme Performance / Performance Extrema:** Optimized components using `memo`, `useMemo`, `useCallback`, and CSS layout containment (`contain: layout paint`) to ensure minimal CPU, GPU, and battery consumption.
* **⚡ Real-Time Editing / Edição em Tempo Real:** Seamless live editing blocks for instant customization of texts, galleries, and showcases.
* **🌍 Bilingual Support / Suporte Bilíngue:** Fully integrated internationalization system supporting English and Portuguese.
* **📱 Mobile-First & Responsive / Otimizado para Mobile:** Intelligent viewport scaling and inputs configured (such as `max-sm:text-[16px]`) to prevent unwanted auto-zooming on iOS Safari and Android devices.
* **💬 Direct WhatsApp Checkout / Checkout via WhatsApp:** Streamlined ordering process structured with conversion psychology principles, clean message formatting, and direct image previews via Cloudinary.
* **🎨 Modern UI/UX / UI/UX Moderna:** Clean, compact, and professional layouts inspired by top design benchmarks like Canva and Pinterest.

---

## 🛠️ Tech Stack / Tecnologias Utilizadas

* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons
* **State & Routing / Gerenciamento de Estado & Rotas:** React Router, TanStack React Query
* **Backend & Storage / Backend & Banco de Dados:** Supabase (Real-time database, authentication, and file storage)
* **Optimization / Otimização:** Custom hooks and advanced clean rendering strategies

---

## 📦 Project Structure / Estrutura do Projeto

```text
src/
├── components/          # Reusable UI building blocks and dynamic sections
│   ├── produtos/        # Product forms, gallery, checkout, and storefront cards
│   └── ...              # Modular showcase and layout elements
├── context/             # Global contexts (e.g., LanguageContext for i18n)
├── hooks/               # Custom React hooks (e.g., useWhatsAppOrder, useAdminStore)
├── lib/                 # External service configurations (Supabase client)
├── utils/               # Constants, formatters, and helper functions
└── pages/               # Main application views and routing entry points