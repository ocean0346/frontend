import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  color = 'indigo-600',
  text
}) => {
  let dimensions = '';
  switch (size) {
    case 'sm':
      dimensions = 'h-6 w-6';
      break;
    case 'lg':
      dimensions = 'h-16 w-16';
      break;
    default:
      dimensions = 'h-10 w-10';
      break;
  }

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className={`${dimensions} border-t-2 border-b-2 border-${color} rounded-full animate-spin`}></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
};

export default Loader; 