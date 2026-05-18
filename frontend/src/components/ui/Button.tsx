import React from 'react';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  href?: string;
  as?: 'button' | 'a';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  href,
  as = 'button',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-colors duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark',
    secondary: 'bg-secondary text-dark hover:bg-gray-200',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  const content = (
    <>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </>
  );

  const commonProps = {
    className: `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${className}`,
    disabled: disabled || isLoading,
  };

  if (href && as === 'a') {
    return (
      <Link href={href} className={commonProps.className} {...(props as any)}>
        {content}
      </Link>
    );
  }

  return (
    <button
      {...commonProps}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
