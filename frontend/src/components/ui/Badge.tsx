import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pink' | 'gray';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'pink', className = '' }) => {
  const variants = {
    pink: 'bg-primary text-white',
    gray: 'bg-secondary text-dark',
  };

  return (
    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
