 
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12 flex justify-between px-6 flex-wrap">

        

        <div className="w-1/3">
            <div className="">
                 <h3 className="text-2xl font-bold text-pink-400 mb-6">Doces da Dinalda🌹</h3>
          <h4 className="font-bold mb-6 flex justify-center">Links Rápidos</h4>
          <ul className="space-y-4 text-gray-400 flex justify-center flex-col items-center">
            <li><a href="/" className="hover:text-white transition-colors">Início</a></li>
            <li><a href="/#/rosas" className="hover:text-white transition-colors">Produtos</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Encomendas</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
          </ul>
        </div>
        </div>

        <div className="w-1/3">
            <h1 className=" font-bold text-center mt-14">Siga-nos nas nossas redes</h1>
        <div className="flex justify-center mt-4  ">
            <img src="public\img\whats.png" alt="" className="h-20" />
            <img src="public/img/igss.png" alt="" className="h-20" />
            
        </div> 
        </div>

        <div className="w-1/3"> 
            <div className="flex justify-center flex-col items-center mt-14">
          <h4 className="font-bold mb-6">Localização</h4>
          <p className="text-gray-400">
            Av. das Rosas, 123<br />
            Bairro Doçura<br />
            São Paulo - SP<br />
            (11) 98888-7777
          </p>
        </div>
        </div>

        <div className="container mx-auto text-center">
            <p className="text-sm">&copy; {new Date().getFullYear()} Doces da Dinalda. Todos os direitos reservados.</p>
        </div>
    </footer>
  );
}
export default Footer;