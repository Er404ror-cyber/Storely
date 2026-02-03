 
const Footer = () => {
  return (
    <footer>   
      <div className="bg-linear-to-b from-blue-500 to-blue-400 text-white py-6 mt-12  px-6 ">
            <h3 className="text-2xl font-bold text-white mb-6">STORELY</h3>

        <div className="flex justify-between">
           <div className="w-1/3">
            <h1 className=" font-bold text-center mb-10">Follow us on our social media</h1>
        <div className="flex justify-center mt-4 gap-6">
            
            <img src="public\img\whatsapp.png" alt="" className="h-10" />
            <img src="public\img\instagram.png" alt="" className="h-10" />
            <img src="public\img\twitter.png" alt="" className="h-10" />
            <img src="public\img\github.png" alt="" className="h-10" />
            
        </div> 
        </div>

        <div className="w-1/3">
          
          <h4 className="font-bold mb-6 flex justify-center ">Quick Links</h4>
          <ul className="space-y-4 text-gray-200 flex justify-center flex-col items-center">
            <li><a href="/" className="hover:text-white transition-colors">Start</a></li>
            <li><a href="/duvidas" className="hover:text-white transition-colors">About</a></li>
            <li><a href="/faq" className="hover:text-white transition-colors">Doubts</a></li>
            <li><a href="/auth" className="hover:text-white transition-colors"></a></li>
          </ul>
        </div>

        <div className="w-1/3"> 
            <div className="flex justify-center flex-col items-center ">
          <h4 className="font-bold mb-6">Logo Aqui</h4>
          
        </div>
        </div>

        </div>
        </div>   
    </footer>
  );
}
export default Footer;