// src/pages/Rosas.jsx

import { Header } from '../../components/header';
import ProdutoCard from '../../components/rosas/card';
import { produtos } from '../../data/produtos';

const Rosas = () => {
  
  const itemPersonalizado = {
    nome: 'Pedido Personalizado',
    descricao: 'Não encontrou o que procurava? Crie seu presente único! Fale connosco para um pedido personalizado que não esteja no catálogo.',
    id: 'personalizado',
  };

  const handlePersonalizarClick = () => {
    const numeroTelefone = '258822451479'; // Seu número
    const mensagem = 'Olá! Gostaria de fazer um *Pedido Personalizado* que não está no catálogo. Poderia me ajudar?';
    const url = `https://wa.me/${numeroTelefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  }

  return (
    <div className='bg-gray-50 min-h-screen'> {/* Cor de fundo mais suave */}
      <Header/>
      
      <div className='container mx-auto px-6 py-10'>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 mb-12">
          🌹 Catálogo de Produtos Exclusivos
        </h1>
        
        {/* ➡️ NOVO LAYOUT DE GRID RESPONSIVO: Simples e Profissional */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            
            {/* Renderiza todos os produtos diretamente, deixando o grid gerenciar as colunas */}
            {produtos.map(produto => (
              <ProdutoCard key={produto.id} produto={produto} />
            ))}

            {/* ➡️ Item Personalizado Integrado ao Grid (com estilo de card) */}
            <div className="flex justify-center">
                <div 
                    className="w-full h-full p-6 flex flex-col items-center justify-center 
                                rounded-xl border-4 border-dashed border-blue-400 bg-blue-50 
                                shadow-lg transition-all duration-300 hover:shadow-xl 
                                hover:border-blue-600 cursor-pointer"
                    onClick={handlePersonalizarClick}
                >
                    <svg className="w-12 h-12 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    <h2 className="text-xl font-extrabold text-blue-900 mb-2 text-center">{itemPersonalizado.nome}</h2>
                    <p className="text-blue-700 mb-6 text-sm text-center">
                        {itemPersonalizado.descricao}
                    </p>
                    <button
                        className="w-full rounded-full py-3 bg-blue-600 text-white font-bold 
                                   hover:bg-blue-700 transition duration-200 shadow-md"
                        type="button"
                    >
                        Contactar para Personalizar
                    </button>
                </div>
            </div>

        </div> {/* Fim do Grid */}
        
      </div>
    </div> 
  )
}

export default Rosas;