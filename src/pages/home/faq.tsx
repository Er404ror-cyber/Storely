export const Faq = () => {
    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <h1 className="text-4xl font-bold text-center mb-8">Frequently Asked Questions</h1>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">What is Petal Rose?</h2>
                    <p>Petal Rose is a platform that allows you to create stunning websites with ease, using pre-designed templates and a user-friendly interface.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">How much does it cost?</h2>
                    <p>Petal Rose offers a variety of pricing plans, including a free tier with basic features. Premium plans with additional features are available at competitive rates.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">Can I use my own domain?</h2>
                    <p>Yes, you can connect your own custom domain to your Petal Rose website for a more professional appearance.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold mb-4">Is there customer support available?</h2>
                    <p>Absolutely! Our customer support team is available 24/7 to assist you with any questions or issues you may encounter.</p>
                </div>
            </div>

            <section className="bg-linear-to-b from-neutral-900 to-black py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* TÍTULO */}
        <div className="flex items-center gap-3 mb-12">
          <span className="text-pink-500 text-2xl">📞</span>
          <h2 className="text-3xl font-bold text-white">Contactos</h2>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* VENDAS */}
          <div className="bg-neutral-800 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Vendas</h3>
            <div className="border-b border-white/10 mb-4"></div>

            <p className="text-blue-400 mb-4">← vendas@orn.co.mz</p>
            <p className="text-green-400">📞 +258 844775094</p>
          </div>

          {/* INFORMAÇÕES */}
          <div className="bg-neutral-800 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Informações</h3>
            <div className="border-b border-white/10 mb-4"></div>

            <p className="text-blue-400 mb-4">← info@orn.co.mz</p>
            <p className="text-green-400">📞 +258 879272636</p>
          </div>

          {/* SUPORTE */}
          <div className="bg-neutral-800 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Suporte</h3>
            <div className="border-b border-white/10 mb-4"></div>

            <p className="text-blue-400 mb-4">← suporte@orn.co.mz</p>
            <p className="text-green-400">📞 +258 863710091</p>
          </div>

          {/* RH */}
          <div className="bg-neutral-800 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">RH</h3>
            <div className="border-b border-white/10 mb-4"></div>

            <p className="text-blue-400 mb-4">← rh@orn.co.mz</p>
            <p className="text-green-400">📞 +258 21321127</p>
          </div>

        </div>
      </div>
    </section>
        </div>
    );
} 