// src/themeInit.ts

const initTheme = () => {
  // 1. Tenta buscar a escolha manual do usuário
  const savedTheme = localStorage.getItem('theme');

  // 2. Se houver escolha salva, aplica imediatamente
  if (savedTheme) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  } 
  // 3. Se não houver, decide pela hora, mas NÃO salva no localStorage
  else {
    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour < 6; // Noite: 18h às 06h

    if (isNight) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

// Executa imediatamente para evitar o "flicker" de cor ao carregar a página
initTheme();

export {};