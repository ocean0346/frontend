import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold">ShopNow</h2>
            <p className="text-gray-400 mt-1">The best shopping experience</p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Shop</h3>
              <ul className="space-y-1 text-gray-400">
                <li><a href="/" className="hover:text-white">All Products</a></li>
                <li><a href="/" className="hover:text-white">New Arrivals</a></li>
                <li><a href="/" className="hover:text-white">Best Sellers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <ul className="space-y-1 text-gray-400">
                <li><a href="/" className="hover:text-white">About Us</a></li>
                <li><a href="/" className="hover:text-white">Contact</a></li>
                <li><a href="/" className="hover:text-white">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400">
          <p>© {currentYear} ShopNow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 