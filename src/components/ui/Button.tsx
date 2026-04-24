import React, { ReactNode, ButtonHTMLAttributes, CSSProperties } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isIconOnly?: boolean;
  isLoading?: boolean;
  children: ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    isIconOnly = false,
    isLoading = false,
    className = '',
    disabled,
    children,
    ...props
  }, ref) => {

    const sizeMap = {
      sm: 'h-9 px-2 text-sm gap-2',
      md: 'h-11 px-4 text-base gap-2',
      lg: 'h-12 px-6 text-lg gap-3',
    };

    const variantMap = {
      primary: 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white hover:shadow-lg hover:shadow-blue-500/30 focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2',
      secondary: 'bg-[var(--color-secondary-light)] text-[var(--color-secondary-dark)] hover:bg-[var(--color-secondary)] hover:text-white focus:outline-2 focus:outline-[var(--color-secondary)] focus:outline-offset-2',
      danger: 'bg-[var(--color-error)] text-white hover:bg-[var(--color-error-dark)] hover:shadow-lg hover:shadow-red-500/30 focus:outline-2 focus:outline-[var(--color-error)] focus:outline-offset-2',
      ghost: 'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-background)] focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2',
    };

    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          btn btn-${variant} btn-${size}
          inline-flex items-center justify-center
          font-semibold rounded-[var(--radius-md)]
          transition-all duration-[var(--duration-base)] ease-[var(--easing-in-out)]
          active:scale-98 select-none
          ${variantMap[variant]}
          ${sizeMap[size]}
          ${isIconOnly ? 'p-0 w-auto' : ''}
          ${disabledClass}
          ${className}
        `.trim()}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin">⟳</span>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
