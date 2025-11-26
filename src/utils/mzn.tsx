// src/utils/formatUtils.js (Novo arquivo para consistência)

export const formatarPrecoMZN = (preco) => {
    // Garantir que o preço seja um número
    const valor = Number(preco);
    if (isNaN(valor)) return "MZN 0.00"; 
    
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN', 
      minimumFractionDigits: 2,
    }).format(valor);
  };