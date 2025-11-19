import type { Produto } from "../types/details";

export const produtos: Produto[] = [    
    {
      id: 'caixa20rosas',
      nome: 'Caixa Luxo Rosas Vermelhas',
      categoria: 'rosas',
      // Imagens no diretório 'public'
      imagemPrincipal: '/img/2_caixs.JPEG',
      descricaoCurta: 'Elegância e romantismo em uma caixa luxuosa. 💖',
      descricaoCompleta: 'Nossa Caixa Luxo contém rosas frescas (quantidade a sua escolha) e é o presente ideal para expressar amor e paixão de forma sofisticada. Escolha entre 5, 10, 15 ou 20 rosas.',
      estoque: true,
      precoBase: 250.00, // Preço base por rosa (MZN)
      galeria: [
        '/img/2_caixs.JPEG',
        '/img/rosas/caixa_detalhe_2.jpg', 
        '/img/rosas/caixa_detalhe_3.jpg', 
        '/img/rosas/caixa_detalhe_4.jpg', 
        '/img/rosas/caixa_detalhe_5.jpg', 
        '/img/rosas/caixa_detalhe_6.jpg', 
        '/img/rosas/caixa_detalhe_7.jpg', 
        '/img/rosas/caixa_detalhe_8.jpg',
      ],
      opcoes: { 
        tipo: 'flores',
        unidade: 'rosa',
        opcoesFixas: [5, 10, 15, 20],
        multiplicadorPreco: true,
      }
    },
    {
      id: 'buque20rosas',
      nome: 'Bouquet de Rosas Clássico',
      categoria: 'rosas',
      imagemPrincipal: '/img/1_boque.JPEG',
      descricaoCurta: 'Clássico que encanta qualquer amante de flores.',
      descricaoCompleta: 'Bouquet de rosas frescas (quantidade a sua escolha), elegantemente embalado. Perfeito para demonstrar carinho e apreço. Escolha entre 5, 10, 15 ou 20 rosas.',
      estoque: true,
      precoBase: 200.00, // Preço base por rosa (MZN)
      galeria: [
        '/img/1_boque.JPEG',
        '/img/rosas/buque_detalhe_2.jpeg',
        '/img/rosas/buque_detalhe_3.jpg',
        '/img/rosas/buque_detalhe_4.jpg',
        '/img/rosas/buque_detalhe_5.jpg',
        '/img/rosas/buque_detalhe_6.jpg',
      ],
       opcoes: {
        tipo: 'flores',
        unidade: 'rosa',
        opcoesFixas: [5, 10, 15, 20],
        multiplicadorPreco: true,
      }
    },
    {
      id: 'rosacetim',
      nome: 'Rosa de Cetim Duradoura',
      categoria: 'rosas',
      imagemPrincipal: '/img/cetim.JPEG',
      descricaoCurta: 'Arte floral que dura para sempre.',
      descricaoCompleta: 'Rosa de cetim artesanal, uma lembrança que dura para sempre, com um toque de delicadeza e sofisticação.',
      estoque: true,
      precoBase: 500.00, // Preço fixo por unidade (MZN)
      galeria: [
        '/img/cetim.JPEG',
        '/img/rosas/cetim_detalhe_2.jpg',
        '/img/rosas/cetim_detalhe_3.jpg',
        '/img/rosas/cetim_detalhe_4.jpg',
      ],
      opcoes: {
        tipo: 'quantidade',
        unidade: 'unidade',
        opcoesFixas: [1, 2, 3, 5],
      }
    },
    // --- Bolos / Doces ---
    {
      id: 'bolonormal',
      nome: 'Bolo Simples (Pequeno)',
      categoria: 'bolos',
      imagemPrincipal: '/img/bolos/normal.jpg',
      descricaoCurta: 'Ideal para pequenas celebrações ou degustação individual.',
      descricaoCompleta: 'Bolo Simples (Pequeno), perfeito para celebrar pequenas ocasiões. Escolha o sabor da massa e recheio.',
      estoque: true,
      precoBase: 1200.00,
      galeria: [
        '/img/bolos/normal.jpg',
        '/img/bolos/normal_detalhe_2.jpg',
        '/img/bolos/normal_detalhe_3.jpg',
      ],
      opcoes: { 
        tipo: 'quantidade',
        unidade: 'bolo',
        opcoesFixas: [1, 2], // Opções de quantidade para bolos
      }
    },
    // ... (Outros produtos aqui, garantindo caminhos de imagem como '/img/...' ou '/bolos/...')
  ];