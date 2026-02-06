import { Link } from "react-router-dom";
import Footer from "../../components/footer2";
import { HeaderLog } from "../../components/headerlog";
export const Blog = () => {
    return (
        <div className="">
            <HeaderLog/>
            
         <div className="flex justify-between">  
        <div className="w-1/2 ">
        <div className=" mt-20 ml-10">
        <h1 className="text-5xl font-bold text-black ">Behind the </h1>
        <p className="text-5xl font-bold mb-6 bg-linear-to-r from-blue-500 to-gray-200
        text-transparent bg-clip-text">cameras</p>
        <p className="text-gray-600 text-lg mb-10  w-1/2">
          Welcome to our blog! Here you'll find the latest news, tips, and insights about building and growing your online store. Stay tuned for regular updates and expert advice to help you succeed in the e-commerce world.
        </p>
        </div>
        </div>

        <div className="w-1/2">
        <div className="flex justify-between">
        <div className="w-1/3">
        <img
            src="https://www.creativosonline.org/wp-content/uploads/2014/12/que-es-una-imagen.jpg"
            alt="Imagem"
            className="w-40 h-70 mt-20 flex items-center justify-center border-2
            border-blue-400 rounded-2xl "
          />
        </div>

        <div className="w-1/3">
        <img src="https://wallpapercave.com/wp/wp1848543.jpg" 
             alt="img"
             className="w-40 h-70 mt-20 flex items-center justify-center border-2
             border-blue-400 rounded-2xl"/>
        </div>

        <div className="w-1/3">
        <img src="https://wallpaperaccess.com/full/38191.jpg" 
             alt="img"
             className="w-40 h-70 mt-20 flex items-center justify-center border-2
             border-blue-400 rounded-2xl hover:p-10" />
        </div>
        </div>

        </div>
        </div>

        <div className="mt-20 ml-10">
          <p className="text-5xl font-bold mb-2">Most visited stores </p>
          <p className="text-5xl font-bold">of the month</p>
          <p className="text-gray-600 text-lg mb-4 mt-2">See all the stores that were most visited this month and use them as inspiration to creat your own</p>
          <div className="mb-6 gap-4 flex flex-wrap">
            <Link to="" className="border border-gray-300 p-2 text-gray-600 hover:text-black hover:border-black rounded-2xl">January </Link>
            <Link to="" className="border border-gray-300 p-2 text-gray-600 hover:text-black hover:border-black rounded-2xl">February </Link>
            <Link to="" className="border border-gray-300 p-2 text-gray-600 hover:text-black hover:border-black rounded-2xl">March </Link>
            <Link to="" className="border border-gray-300 p-2 text-gray-600 hover:text-black hover:border-black rounded-2xl">April </Link>
            <Link to="" className="border border-gray-300 p-2 text-gray-600 hover:text-black hover:border-black rounded-2xl">May </Link>
            <Link to="" className="border border-gray-300 p-2 text-gray-600 hover:text-black hover:border-black rounded-2xl">June </Link>
            <Link to="" className="border border-gray-300 p-2 text-gray-600 hover:text-black hover:border-black rounded-2xl">July </Link>
            <Link to="" className="border border-gray-300 p-2 text-gray-600 hover:text-black hover:border-black rounded-2xl">August </Link>
            <Link to="" className="border border-gray-300 p-2 text-gray-600 hover:text-black hover:border-black rounded-2xl">September </Link>
            <Link to="" className="border border-gray-300 p-2 text-gray-600 hover:text-black hover:border-black rounded-2xl">October </Link>
            <Link to="" className="border border-gray-300 p-2 text-gray-600 hover:text-black hover:border-black rounded-2xl">November </Link>
            <Link to="" className="border border-gray-300 p-2 text-gray-600 hover:text-black hover:border-black rounded-2xl">December </Link>
          </div>
          <div className="flex justify-between">
            <div className="w-1/4">
            <img src="https://wallpaperaccess.com/full/489337.jpg" 
                 alt=""
                 className="w-70 h-80 rounded-2xl" />
                 <p>flower store</p>
                 </div>
            <div className="w-1/4">
            <img src="https://wallpapercave.com/wp/wp2225269.jpg" 
                 alt=""
                 className="w-70 h-80 rounded-2xl" />
                 <p>shein store</p>
                 </div>
            <div className="w-1/4">
            <img src="https://www.fotonerd.it/wp-content/uploads/2020/11/fotonerd-luminar-4-aggiornamento-big-sur-feat.jpg" 
                 alt=""
                 className="w-70 h-80 rounded-2xl" />
                 <p>candy store</p>
                 </div>
            <div className="w-1/4">
            <img src="https://cdn.pixabay.com/photo/2024/07/19/08/16/waves-8905720_1280.png" 
                 alt=""
                 className="w-70 h-80 rounded-2xl" />
                 <p>hair store</p>
                 </div>
            
          </div>
        </div>

          <p className="text-5xl font-bold mt-20 ml-10">Late updadets</p>
        <div className="flex justify-between">

          <div className="w-1/2 ml-20 mt-10">
          <img src="https://i.pinimg.com/originals/37/9e/4d/379e4d1753745cc45551022cc621f378.jpg" 
               alt=""
               className="max-w-2xl h-80 mr-10 border-4 border-blue-400 rounded-2xl" />

               <div className="mt-4">
                <p className="text-blue-500">Biggest update</p>
               <p className="text-2xl font-semibold">Load bugh</p>
               <p className="text-gray-800">We fix the problem wiht uploads for low internet</p>
               </div>
               </div>

          <div className="w-1/2 grid mt-10  gap-2">
          <div className="flex">
          <div className="w-1/3 flex justify-between">
          <img src="https://image.cdn2.seaart.ai/2023-10-06/19157478906307589/d01e7026e489e9d4744b4635ecf2898cf8f87e26_high.webp" 
               alt=""
               className="w-30 h-35 border-4 border-blue-400 rounded-2xl " />
               </div>
               <div className=" ">
                <p className="text-blue-500">New  update</p>
               <p className="text-2xl font-bold ml-">New logo. We have new logo to represent our story</p>
               <p className="text-gray-600 mt-4">Give us your opinion </p>
               </div>
          </div>
          <div className="flex">
          <div className="w-1/3 flex justify-between">
          <img src="https://tse3.mm.bing.net/th/id/OIP.D0P5MTaO_Oc3nrvDXfYw4QHaQC?w=640&h=1386&rs=1&pid=ImgDetMain&o=7&rm=3" 
               alt=""
               className="w-30 h-35 border-4 border-blue-400 rounded-2xl " />
               </div>
                <div className=" ">
                <p className="text-blue-500">New  update</p>
               <p className="text-2xl font-bold ml-">New logo. We have new logo to represent our story</p>
               <p className="text-gray-600 mt-4">Give us your opinion </p>
               </div>
          </div>
          <div className="flex">
          <div className="w-1/3 flex justify-between">
          <img src="https://img.freepik.com/premium-photo/building-city-during-sunset-warm-golden-light-setting-sun-paints-urban-skyline_750630-5400.jpg" 
               alt=""
               className="w-30 h-35 border-4 border-blue-400 rounded-2xl" />
               </div>
                <div className=" ">
                <p className="text-blue-500">New  update</p>
               <p className="text-2xl font-bold ml-">New logo. We have new logo to represent our story</p>
               <p className="text-gray-600 mt-4">Give us your opinion </p>
               </div>
          </div>
          </div>
        </div>
        <Footer/>
        </div>
    );
};
