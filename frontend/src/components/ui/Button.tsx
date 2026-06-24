import React from 'react';
import Link from 'next/link';

interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

interface ButtonAsButtonProps extends BaseButtonProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: never;
}

interface ButtonAsLinkProps extends BaseButtonProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
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
  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${className}`;

  if ('href' in props && props.href) {
    const { href, ...linkProps } = props as ButtonAsLinkProps;
    return (
      <Link href={href} className={combinedClassName} {...(linkProps as any)}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={combinedClassName}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
};

export default Button;
