// src/pages/DetalhesProduto.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { produtos } from '../../data/produtos';
import { formatarPrecoMZN } from '../../utils/mzn';
import { Header } from '../../components/headeroficial';
import type { Produto } from '../../types/details';
import FullScreenModal from '../../components/rosas/fullscrean';

const SLIDESHOW_INTERVAL = 8000;

interface DetalhesParams extends Record<string, string | undefined> {
    id: string;
}

const DetalhesProduto: React.FC = () => {
  const { id } = useParams<DetalhesParams>();
  const navigate = useNavigate();
  const produto: Produto | undefined = produtos.find(p => p.id === id); 

  const [quantidade, setQuantidade] = useState<number>(1);
  const [fotoSelecionada, setFotoSelecionada] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null); 
  const [isHovered, setIsHovered] = useState<boolean>(false); 

  // ➡️ CORRIGIDO: Tipagem do Timer para number (padrão do navegador)
  const slideshowTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);

  const stopSlideshow = (): void => {
    // ➡️ Uso de window.clearInterval para garantir que o tipo number está a ser usado
    if (slideshowTimerRef.current !== null) window.clearInterval(slideshowTimerRef.current);
    if (progressTimerRef.current !== null) window.clearInterval(progressTimerRef.current);
    slideshowTimerRef.current = null;
    progressTimerRef.current = null;
    setProgress(0);
  };

  const startSlideshow = (): void => {
      stopSlideshow(); // Limpa ANTES de começar

      if (!produto || !produto.galeria || produto.galeria.length === 0 || isHovered) return;

      slideshowTimerRef.current = window.setInterval(() => {
          setActiveIndex(prevIndex => (prevIndex + 1) % produto.galeria.length);
          setProgress(0);
      }, SLIDESHOW_INTERVAL);

      progressTimerRef.current = window.setInterval(() => {
          setProgress(prevProgress => {
              const newProgress = prevProgress + (100 / (SLIDESHOW_INTERVAL / 100));
              return newProgress > 100 ? 100 : newProgress;
          });
      }, 100);
  };
  
  // ➡️ Lógica do Efeito: Inicialização e Ciclo de Vida do Slideshow
  useEffect(() => {
    if (produto) {
        // 1. Inicializa o estado (só corre na primeira montagem ou se o produto mudar)
        const initialQuantity = produto.opcoes?.opcoesFixas?.[0] || 1;
        setQuantidade(initialQuantity);

        if (produto.galeria && produto.galeria.length > 0) {
            setFotoSelecionada(produto.galeria[0]);
            setActiveIndex(0);
        } else {
            setFotoSelecionada(produto.imagemPrincipal);
        }
        
        // 2. Inicia o Slideshow após a inicialização do estado
        startSlideshow();

    } else {
        navigate('/');
    }

    // 3. Função de Cleanup: Crucial para evitar o bug de múltiplos timers
    return () => {
        stopSlideshow();
    };
  }, [produto, navigate]); // Dependências: produto e navigate

  // ➡️ Efeito para atualizar a foto quando activeIndex muda (sem iniciar timers)
  useEffect(() => {
    if (produto && produto.galeria && produto.galeria.length > 0) {
      setFotoSelecionada(produto.galeria[activeIndex]);
    }
  }, [activeIndex, produto]);


  const handleWhatsAppClick = () => {
    const numeroTelefone = '258822451479'; 
    const precoDisplay = formatarPrecoMZN(precoTotal);

    // Constrói o URL completo da imagem (necessário para a pré-visualização)
    const baseUrl = window.location.origin;
    const imageUrl = `${baseUrl}${produto.imagemPrincipal}`;

    let mensagem = `*🌸 PEDIDO DE ENCOMENDA 🌸*\n\n`;
    mensagem += `Olá! Gostaria de encomendar ou saber mais sobre o seguinte produto:\n\n`;
    
    // ➡️ DETALHES CLAROS E PROFISSIONAIS
    mensagem += `*🏷️ Produto:* ${produto.nome}\n`;
    mensagem += `*📏 Quantidade:* ${quantidade} ${produto.opcoes?.unidade || 'unidade(s)'}\n`;
    mensagem += `*💰 Valor Estimado:* ${precoDisplay}\n\n`;
    
    // ➡️ INSTRUÇÃO CLARA E LINK DA FOTO
    mensagem += `*Foto do Produto:* (O link abaixo deve pré-visualizar a imagem)\n`;
    mensagem += `${imageUrl}\n\n`;
    
    mensagem += `Poderia, por favor, *confirmar a disponibilidade e o valor final*?\n`;
    mensagem += `Obrigado!`;

    const url = `https://wa.me/${numeroTelefone}?text=${encodeURIComponent(mensagem)}`;
    
    // ➡️ ABRIR O CHAT
    window.open(url, '_blank');
};
  const handleMouseEnter = (): void => {
    setIsHovered(true);
    stopSlideshow();
  };

  const handleMouseLeave = (): void => {
    setIsHovered(false);
    startSlideshow();
  };
  
  const selectPhoto = (photoUrl: string, index: number): void => {
    setFotoSelecionada(photoUrl);
    setActiveIndex(index);
    if (!isHovered) {
        // Reinicia o slideshow, o que fará o stopSlideshow dentro dele
        startSlideshow(); 
    }
  };

  if (!produto) {
    return null; 
  }
  
  const precoTotal: number = produto.precoBase * quantidade;

 
  return (
    <div className='bg-gray-50 min-h-screen'>
      <Header />
      
      <div className="container mx-auto p-2 md:px-10 py-10 pt-16">
        <button 
          onClick={() => navigate(-1)} 
          className="text-blue-700 hover:text-blue-900 mb-8 flex items-center font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Voltar para o Catálogo
        </button>

        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">{produto.nome}</h1>

          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Galeria de Fotos */}
            <div className="w-full lg:w-7/12">
              
              {/* Foto Principal com Hover e Tela Cheia */}
              <div 
                className="mb-4 rounded-xl overflow-hidden h-96 shadow-xl relative cursor-zoom-in group"
                onClick={() => setFullScreenImage(fotoSelecionada)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <img 
                  src={fotoSelecionada}
                  alt={produto.nome}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                 {/* Barra de Progresso */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-300">
                  <div 
                    className={`h-full bg-blue-500 transition-all duration-100 ease-linear ${isHovered ? 'hidden' : ''}`} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex overflow-x-auto space-x-3 p-2 bg-gray-100 rounded-lg">
                {Array.isArray(produto.galeria) && produto.galeria.map((foto, index) => (
                  <img
                    key={index}
                    src={foto}
                    alt={`Galeria ${index + 1}`}
                    className={`w-20 h-20 object-cover rounded-md flex-shrink-0 cursor-pointer border-2 transition duration-300 transform hover:scale-105 ${
                      index === activeIndex ? 'border-blue-700 ring-4 ring-blue-200' : 'border-gray-300'
                    }`}
                    onClick={() => selectPhoto(foto, index)}
                  />
                ))}
              </div>
            </div>

            {/* Detalhes do Pedido e Personalização */}
            <div className="w-full lg:w-5/12 pt-4">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Descrição Detalhada</h2>

              <p className="text-gray-600 mb-6 whitespace-pre-line leading-relaxed">{produto.descricaoCompleta}</p>
              
              <div className="mb-6">
                <span className={`inline-block px-4 py-1 text-sm font-bold rounded-full ${
                  produto.estoque ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {produto.estoque ? 'Em Estoque' : 'Indisponível'}
                </span>
              </div>

              {/* Opção de Escolher Quantidade */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <label htmlFor="quantidade" className="block text-gray-700 font-bold mb-3 text-lg">
                      {produto.opcoes?.tipo === 'flores' ? 
                          `Selecione o número de ${produto.opcoes.unidade}s:` : 
                          'Escolha a Quantidade:'
                      }
                  </label>
                  
                  {produto.opcoes?.opcoesFixas && Array.isArray(produto.opcoes.opcoesFixas) ? (
    <select
        id="quantidade"
        value={quantidade}
        onChange={(e) => setQuantidade(Number(e.target.value))}
        className="w-full p-3 border border-blue-400 rounded-lg shadow-md bg-white text-gray-800 focus:ring-blue-500 focus:border-blue-500 text-base"
    >
       
        {produto.opcoes.opcoesFixas.map(opt => (
            <option key={opt} value={opt}>{opt} {produto.opcoes!.unidade}{opt > 1 && 's'}</option>
        ))}
    </select>
                  ) : (
                      <input
                          type="number"
                          id="quantidade"
                          min="1"
                          value={quantidade}
                          onChange={(e) => setQuantidade(Number(e.target.value) > 0 ? Number(e.target.value) : 1)}
                          className="w-full p-3 border border-blue-400 rounded-lg shadow-md bg-white text-gray-800 focus:ring-blue-500 focus:border-blue-500 text-base"
                      />
                  )}
              </div>

              {/* Preço por Unidade */}
              <div className="text-lg font-medium text-gray-800 mb-3">
                Preço por {produto.opcoes?.multiplicadorPreco ? produto.opcoes.unidade : 'unidade'}: 
                <span className="text-xl font-bold text-gray-900 ml-2">{formatarPrecoMZN(produto.precoBase)}</span>
              </div>

              {/* Total Estimado */}
              <div className="text-2xl font-black text-gray-800 mb-8">
                Total Estimado: 
                <span className="text-green-600 ml-2">{formatarPrecoMZN(precoTotal)}</span>
              </div>

              {/* Botão de WhatsApp */}
              {/* Lógica do handleWhatsAppClick omitida para brevidade no JSX */}
              <button
                onClick={handleWhatsAppClick}
                disabled={!produto.estoque}
                className={`w-full flex items-center justify-center p-4 rounded-xl text-white font-extrabold text-lg 
                  transition duration-300 shadow-lg ${
                  produto.estoque 
                    ? 'bg-green-500 hover:bg-green-600 transform hover:scale-[1.01]' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.0001 24C5.3731 24 0 18.6269 0 12.0001C0 5.3731 5.3731 0 12.0001 0C18.6269 0 24 5.3731 24 12.0001C24 18.6269 18.6269 24 12.0001 24ZM18.2393 15.6835C17.7018 17.061 16.2731 17.9042 14.739 17.9042C14.161 17.9042 13.5647 17.8188 12.9867 17.6521C8.2818 16.4382 5.3093 11.7584 5.3093 7.0535C5.3093 5.5194 6.1525 4.0908 7.5300 3.5532C7.8180 3.4442 8.1691 3.4442 8.4287 3.5532L10.0469 4.3809C10.3703 4.5105 10.6083 4.8086 10.6628 5.1598C10.7482 5.5109 10.6083 5.9189 10.3307 6.2701L9.6508 7.0255C9.4001 7.2913 9.3456 7.6425 9.5317 7.9659C10.0719 8.8471 10.9234 9.9404 11.9686 10.9856C13.0138 12.0308 14.1072 12.8824 14.9884 13.4225C15.3118 13.6086 15.6630 13.5542 15.9288 13.3035L16.6558 12.5900C16.9792 12.3394 17.3872 12.2045 17.7384 12.2900C18.0895 12.3601 18.3876 12.5981 18.5172 12.9215L19.3449 14.5397C19.4539 14.7993 19.4539 15.1505 19.3449 15.4385L18.2393 15.6835Z"/></svg>
                {`Fazer Pedido (${produto.estoque ? 'Disponível' : 'Indisponível'})`}
              </button>
            </div>
          </div>
        </div>
      </div>

      <FullScreenModal 
        imageUrl={fullScreenImage} 
        onClose={() => setFullScreenImage(null)} 
      />
    </div>
  );
};

export default DetalhesProduto;