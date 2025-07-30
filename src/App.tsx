import React from 'react';
import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <CategoryNav />
      
      <main className="flex-1">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-green-800 to-green-900 text-white py-8">
          <div className="max-w-[1440px] mx-auto px-4 text-center">
            <h1 className="text-[22px] md:text-[28px] font-bold mb-2">
              Welcome to TFMshop
            </h1>
            <p className="text-[16px] md:text-[18px] text-green-100">
              Discover millions of products at unbeatable prices
            </p>
          </div>
        </div>

        {/* Products Section */}
        <section>
          <div className="max-w-[1440px] mx-auto px-4 py-6">
            <h2 className="text-[18px] md:text-[22px] font-bold text-gray-900 mb-6">
              Featured Products
            </h2>
          </div>
          <ProductGrid />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;