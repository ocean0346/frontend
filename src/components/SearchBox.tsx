import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchBoxProps {
  setKeyword?: (keyword: string) => void;
  redirect?: boolean;
  className?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  setKeyword, 
  redirect = true,
  className = ''
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting search:', searchTerm);
    
    if (searchTerm.trim()) {
      if (redirect) {
        navigate(`/search/${searchTerm}`);
      } else if (setKeyword) {
        setKeyword(searchTerm);
      }
    } else {
      if (redirect) {
        navigate('/');
      } else if (setKeyword) {
        setKeyword('');
      }
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={submitHandler} className={`flex ${className}`}>
      <div 
        className={`relative flex-grow transition-all duration-300 ${
          isFocused ? 'transform scale-[1.02]' : ''
        }`}
      >
        <div className={`
          relative flex items-center w-full overflow-hidden
          bg-white rounded-full shadow-md transition-all duration-300
          ${isFocused ? 'ring-2 ring-indigo-400 shadow-lg' : 'hover:shadow-lg'}
        `}>
          <div className="flex items-center pl-4 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-colors duration-300 ${isFocused ? 'text-indigo-500' : 'text-gray-400'}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            name="q"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full px-3 py-3 text-gray-700 border-none focus:outline-none bg-transparent"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="flex items-center justify-center w-8 h-8 mr-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            className="flex items-center justify-center px-6 py-3 ml-1 text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="hidden sm:inline">Tìm</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBox; 