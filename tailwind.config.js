@import "tailwindcss";

/* Ativação por classe para o Tailwind v4 */
@variant dark (&:where(.dark, .dark *));

/* Transição de cores suave nas divs que você já estilizou */
@layer base {
  *, ::after, ::before {
    transition-property: background-color, color, border-color;
    transition-duration: 350ms;
    transition-timing-function: linear; /* Linear é mais leve para a CPU */
  }
}

/* Estrutura da Transição de Tela */
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
  /* Animação diagonal do topo-esquerdo ao fundo-direito */
  animation: diagonal-sweep 700ms cubic-bezier(0.25, 1, 0.5, 1) both;
  will-change: clip-path;
}

::view-transition-old(root) {
  z-index: 1;
}

@keyframes diagonal-sweep {
  from {
    /* Começa no ponto 0,0 (Canto Superior Esquerdo) */
    clip-path: polygon(0% 0%, 0% 0%, 0% 0%);
  }
  to {
    /* Expande em triângulo para cobrir tudo até o Canto Inferior Direito */
    clip-path: polygon(0% 0%, 250% 0%, 0% 250%);
  }
}

/* Bloqueia cliques durante a animação para economizar processamento */
html.view-transitioning {
  pointer-events: none;
}