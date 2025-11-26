// src/components/rosas/card.jsx (Refatorado para melhor UX)

import { Link } from 'react-router-dom';

const ProdutoCard = ({ produto }) => {
  const linkPath = `/rosas/${produto.id}`;

  const precoFormatado = new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN', 
  }).format(produto.precoBase);

  const handleImageClick = (e) => {
    console.log(`Abrir Modal/Zoom para o produto: ${produto.nome}`);
  };

  return (
    // ➡️ NOVO CONTAINER: Agora é um DIV, permitindo que os LINKS sejam internos e separados.
    <div className="w-full h-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden 
      transition-all duration-300 transform hover:shadow-xl hover:translate-y-[-2px] 
      border border-gray-100"> 

      {/* 1. ÁREA DA IMAGEM: Agora é um Link E uma área de clique separada (Zoom) */}
      <div className="relative">
        <Link to={linkPath} className='block'>
            <div 
              className="h-64 overflow-hidden cursor-pointer"
              // Usar handleImageClick na imagem para evitar o Link do pai,
              // mas como não é o pai, o preventDefault já não é estritamente necessário
              // se o Link for o que envolve a imagem. Vamos mantê-lo simples:
              onClick={handleImageClick} 
            > 
                <img 
                  src={produto.imagemPrincipal}
                  alt={produto.nome}
                  className="w-full h-full object-cover transition duration-300 hover:scale-105" 
                />
            </div>
        </Link>
         
         {/* ➡️ Etiqueta de Preço no Canto: Visual limpo */}
         <div className="absolute top-0 right-0 bg-blue-700 text-white font-semibold px-3 py-1 rounded-bl-lg text-sm shadow-md">
            A Partir de
         </div>
      </div>

      <div className="p-5 flex flex-col justify-between h-auto">
        
        {/* 2. TÍTULO E DESCRIÇÃO */}
        <div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2 line-clamp-2">
                {produto.nome}
              </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {produto.descricaoCurta}
          </p>
        </div>
        
        {/* 3. PREÇO E AÇÃO (Base) */}
        <div className='mt-4 pt-3 border-t border-gray-100'>
          
          <p className="text-2xl font-black text-green-700 mb-4 tracking-wide">
             {precoFormatado}
          </p>
          
          {/* ➡️ BOTÃO DE DETALHES: Link explícito e focado */}
          <Link 
            to={linkPath} 
            className='w-full block text-center rounded-lg py-3 bg-blue-700 text-white 
            font-bold text-base hover:bg-blue-800 transition duration-300 shadow-md 
            tracking-wider'
          >
            VER DETALHES
          </Link>
          
        </div>
      </div>       
    </div>
  );
};

export default ProdutoCard;