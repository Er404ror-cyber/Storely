// src/themeInit.ts

const initTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  
  // Se for explicitamente 'dark' ou 'light'
  if (savedTheme === 'dark' || savedTheme === 'light') {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  } 
  // Se for 'auto' OU se for a primeira vez do usuário (null)
  else {
    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour < 6;
    document.documentElement.classList.toggle('dark', isNight);
    // Opcional: localStorage.setItem('theme', 'auto'); 
  }
};

initTheme();
export {};