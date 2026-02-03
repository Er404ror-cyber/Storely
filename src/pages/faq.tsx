import { Link } from "react-router-dom";
import { HeaderLog } from "../components/headerlog";
import { ArrowBigLeftDash } from "lucide-react";

export const Faq = () => {
    return (
        <div className="h-screen ">
            <HeaderLog/>
            <Link to="/duvidas" className="ml-10 mt-6 inline-block text-orange-500 hover:underline ">
        <ArrowBigLeftDash className="bg-cyan-800 rounded-2xl "  /> 
      </Link>
            <div className="flex flex-col justify-center items-center mt-20">
        <h1 className="text-5xl font-bold text-black mb-6">Frequently Asked Questions</h1>
        <p className="text-gray-600 text-lg mb-10 text-center w-1/2">
          Here are some of the most common questions our users have. If you need further assistance, feel free to contact us!
        </p>
        </div>
        <div className="w-3/4 mx-auto space-y-6 ">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">How do I create my online store?</h2>
            <p className="text-gray-700">
              Creating your online store is easy! Simply sign up for an account, choose a template, and start adding your products. Our drag-and-drop editor makes it simple to customize your site.
            </p>
          </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">What payment methods do you support?</h2>
            <p className="text-gray-700">
                We support a variety of payment methods including credit/debit cards, PayPal, and other popular payment gateways. You can easily set up your preferred payment options in the store settings.
            </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Can I customize the design of my website?</h2>
            <p className="text-gray-700">
                Absolutely! Our platform offers a range of customizable templates and a drag-and-drop editor that allows you to personalize the look and feel of your website to match your brand.
            </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Is there a free trial available?</h2>
            <p className="text-gray-700">
                Yes, we offer a free trial period for new users to explore our platform and its features. You can sign up and start building your store without any initial cost.
            </p>
            </div>
        </div>
            
        </div>
    );
};
