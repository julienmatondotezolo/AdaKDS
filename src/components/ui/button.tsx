'use client';

import React from 'react';
import { Button as AdaButton } from 'ada-design-system';
import type { ButtonProps as AdaButtonProps } from 'ada-design-system/dist/components/ui/button';
import { cn } from '@/lib/utils';

interface ButtonProps extends Omit<AdaButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'tiny' | 'icon' | 'icon-sm' | 'icon-lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'default',
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