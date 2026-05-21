import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
  ghost:     'btn-ghost',
  success:   'btn-success',
};

const sizeClass: Record<Size, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  disabled,
  className,
  ...props
}) => (
  <button
    className={cn(variantClass[variant], sizeClass[size], className)}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
    {children}
    {!loading && iconRight}
  </button>
);
