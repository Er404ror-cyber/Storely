// src/themeInit.ts
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    // Se o usuário CLICOU no botão alguma vez, respeitamos essa escolha fixa
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  } else {
    // Se ele NUNCA clicou, decidimos pela hora atual
    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour < 6; // Noite entre 18h e 06h

    if (isNight) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

initTheme();
export {};