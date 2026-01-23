// src/utils/formatUtils.ts

/**
 * Formata um valor numérico para o padrão de moeda de Moçambique (MZN)
 * @param preco - Valor a ser formatado (pode ser número ou string numérica)
 */
export const formatarPrecoMZN = (preco: number | string): string => {
  // Garantir que o preço seja um número
  const valor = Number(preco);
  
  // Se não for um número válido, retorna o padrão zero formatado
  if (isNaN(valor)) {
      return new Intl.NumberFormat('pt-MZ', {
          style: 'currency',
          currency: 'MZN',
      }).format(0);
  }
  
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN', 
    minimumFractionDigits: 2,
  }).format(valor);
};