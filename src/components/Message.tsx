import React from 'react';

type MessageVariant = 'success' | 'error' | 'info' | 'warning';

interface MessageProps {
  variant?: MessageVariant;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Message: React.FC<MessageProps> = ({ 
  variant = 'info', 
  children, 
  onClose, 
  className = '' 
}) => {
  let bgColor = '';
  let textColor = '';
  let iconPath = '';

  switch (variant) {
    case 'success':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      iconPath = 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z';
      break;
    case 'error':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      iconPath = 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z';
      break;
    case 'warning':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      iconPath = 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z';
      break;
    default:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      iconPath = 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z';
      break;
  }

  return (
    <div className={`${bgColor} ${textColor} p-4 rounded-lg mb-4 flex items-start ${className}`}>
      <div className="flex-shrink-0">
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d={iconPath} clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm">{children}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto flex-shrink-0 -mr-1 -mt-1 p-1 rounded-full hover:bg-gray-200 transition-colors focus:outline-none"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Message; 