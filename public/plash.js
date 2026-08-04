// public/splash.js
(function () {
    // 1. Limpeza de Cache Local (Fix para localhost partilhado)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach(r => r.unregister()));
      }
      if (sessionStorage.getItem('last_project') !== 'storely') {
        sessionStorage.clear();
        sessionStorage.setItem('last_project', 'storely');
      }
    }
  
    // 2. CSS de Alta Performance (60fps)
    const style = document.createElement('style');
    style.textContent = `
      #storely-splash {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background-color: #030303;
        display: flex;
        align-items: center;
        justify-content: center;
        /* Contain strict isola o layout, poupando CPU */
        contain: strict;
        will-change: opacity, transform;
        transition: opacity 0.5s ease-out, transform 0.5s ease-out;
      }
  
      .splash-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        /* O estado inicial é ligeiramente abaixo e invisível */
        transform: translateY(16px) scale(0.95);
        opacity: 0;
        /* Curva Apple-like (rápido no início, suave no fim) */
        animation: splashEnter 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        will-change: transform, opacity;
      }
  
      .logo-wrapper {
        width: 120px;
        height: 120px;
        border-radius: 32px;
        background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%);
        border: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      }
  
      .logo-wrapper img {
        width: 80px;
        height: auto;
        image-rendering: -webkit-optimize-contrast;
        filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3));
      }
  
      .splash-title {
        margin-top: 28px;
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 1.6rem;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: 0.35em;
        text-transform: uppercase;
        opacity: 0;
        transform: translateY(10px);
        /* O texto entra com um pequeno atraso (stagger) para dar um ar mais orgânico */
        animation: textEnter 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.2s;
        will-change: transform, opacity;
      }
  
      @keyframes splashEnter {
        to { transform: translateY(0) scale(1); opacity: 1; }
      }
  
      @keyframes textEnter {
        to { transform: translateY(0); opacity: 1; }
      }
  
      /* Animação de Saída (Quando o React carrega) */
      #storely-splash.exit-active {
        opacity: 0 !important;
        transform: scale(1.04) !important;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  
    // 3. HTML do Splash Screen
    const splashHTML = `
      <div id="storely-splash">
        <div class="splash-content">
          <div class="logo-wrapper">
            <img src="/img/Mascote.png?v=storely_final" alt="Storely Logo" fetchpriority="high" />
          </div>
          <h1 class="splash-title">Storely</h1>
        </div>
      </div>
    `;
  
    // 4. Injeção Imediata no DOM
    if (document.currentScript) {
      document.currentScript.insertAdjacentHTML('afterend', splashHTML);
    }
  
    // 5. Destruição e Limpeza de Memória após o carregamento
    window.addEventListener('load', () => {
      setTimeout(() => {
        const splash = document.getElementById('storely-splash');
        if (splash) {
          splash.classList.add('exit-active');
          
          // Remove totalmente do DOM após a animação de saída terminar (500ms)
          setTimeout(() => {
            splash.remove();
            style.remove(); // Limpa o CSS também
          }, 500);
        }
      }, 600); // Tempo mínimo de ecrã para garantir que a animação fluida é vista
    });
  })();