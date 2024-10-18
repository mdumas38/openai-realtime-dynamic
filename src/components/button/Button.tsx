import React from 'react';
import { Icon } from 'react-feather';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: Icon;
  iconPosition?: 'start' | 'end';
  buttonStyle?: 'regular' | 'action' | 'alert' | 'flush';
  isDarkMode?: boolean;
}

export function Button({
  label = 'Okay',
  icon: IconComponent,
  iconPosition = 'start',
  buttonStyle = 'regular',
  isDarkMode = false,
  className = '',
  ...rest
}: ButtonProps) {
  const baseClasses = 'flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200';
  const styleClasses = {
    regular: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    action: 'bg-blue-600 text-white hover:bg-blue-700',
    alert: 'bg-red-600 text-white hover:bg-red-700',
    flush: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700',
  };

  const buttonClasses = `${baseClasses} ${styleClasses[buttonStyle]} ${className}`;

  return (
    <button className={buttonClasses} {...rest}>
      {IconComponent && iconPosition === 'start' && <IconComponent className="w-5 h-5 mr-2" />}
      {label}
      {IconComponent && iconPosition === 'end' && <IconComponent className="w-5 h-5 ml-2" />}
    </button>
  );
}
