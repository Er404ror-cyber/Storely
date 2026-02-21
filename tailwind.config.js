@import "tailwindcss";

/* Ativação por classe para o Tailwind v4 */
@variant dark (&:where(.dark, .dark *));

@layer base {
  /* EVITE USAR * { transition: ... } 
     Isso mata a performance pois o navegador tenta animar TUDO.
     Use classes específicas ou aplique apenas em elementos de UI.
  */
  body {
    @apply bg-[#030303] text-white;
    /* Transição suave apenas no body para o modo dark */
    transition: background-color 350ms linear;
  }
}

/* Estrutura da Transição de Tela (View Transitions API) */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
  display: block;
  position: fixed;
  inset: 0;
}

::view-transition-new(root) {
  z-index: 9999;
  animation: diagonal-sweep 700ms cubic-bezier(0.25, 1, 0.5, 1) both;
  will-change: clip-path;
}

@keyframes diagonal-sweep {
  from {
    clip-path: polygon(0% 0%, 0% 0%, 0% 0%);
  }
  to {
    clip-path: polygon(0% 0%, 250% 0%, 0% 250%);
  }
}

/* Bloqueia cliques durante a animação */
.view-transitioning {
  pointer-events: none;
}