'use client';

import React from 'react';
import { Button as AdaButton, ButtonProps as AdaButtonProps } from 'ada-design-system';
import { cn } from '@/lib/utils';

interface ButtonProps extends Omit<AdaButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  className,
  children,
  ...props
}) => {
  // Map our KDS variants to Ada Design System variants
  const adaVariant = variant === 'danger' ? 'destructive' : 
                     variant === 'success' ? 'success' :
                     variant === 'ghost' ? 'outline' : variant;

  return (
    <AdaButton
      variant={adaVariant as any}
      size={size}
      className={cn('touch-manipulation', className)}
      {...props}
    >
      {children}
    </AdaButton>
  );
};