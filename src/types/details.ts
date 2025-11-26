// src/types/produto.ts

/**
 * Define a estrutura das opções de personalização de um produto.
 */
export interface ProdutoOpcoes {
    // Tipo de personalização: flores, quantidade, etc.
    tipo: 'flores' | 'quantidade' | string; 
    // Unidade de medida: rosa, unidade, bolo, etc.
    unidade: 'rosa' | 'unidade' | 'caixa' | 'cupcake' | 'bolo' | string; 
    // Opções de quantidade fixa disponíveis
    opcoesFixas: number[];
    // Indica se o preço base deve ser multiplicado pela quantidade/opção selecionada
    multiplicadorPreco?: boolean;
}

/**
 * Define a estrutura completa de um item de produto no seu catálogo.
 */
export interface Produto {
    id: string;
    nome: string;
    // Categorias fixas, ou use string se houver flexibilidade
    categoria: 'rosas' | 'bolos' | 'doces' | string; 
    // Caminho da imagem principal (será uma string gerada pelo import)
    imagemPrincipal: string; 
    descricaoCurta: string;
    descricaoCompleta: string;
    estoque: boolean;
    // Preço em Meticais (MZN)
    precoBase: number; 
    // Array de caminhos de imagens para a galeria
    galeria: string[];
    opcoes?: ProdutoOpcoes;
}

/**
 * Define as props esperadas pelo componente FullScreenModal.
 */
export interface FullScreenModalProps {
    imageUrl: string | null;
    onClose: () => void;
}