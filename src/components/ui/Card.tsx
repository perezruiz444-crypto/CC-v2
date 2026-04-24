import React, { type ReactNode, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    interactive = true,
    padding = 'md',
    className = '', 
    ...props 
  }, ref) => {
    
    const paddingMap = {
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={`
          glass-effect
          ${interactive ? 'card-interactive' : ''}
          ${paddingMap[padding]}
          rounded-[var(--radius-lg)]
          transition-all duration-[var(--duration-base)] ease-[var(--easing-in-out)]
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
