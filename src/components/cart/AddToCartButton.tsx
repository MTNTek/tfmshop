'use client';

import React, { useState } from 'react';
import { ShoppingCart, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    inStock?: boolean;
    isPrime?: boolean;
    seller?: string;
  };
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  disabled?: boolean;
  onAddToCart?: () => void;
}

export function AddToCartButton({ 
  product, 
  variant = 'default',
  size = 'md',
  className,
  showIcon = true,
  disabled = false,
  onAddToCart
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async () => {
    if (disabled || !product.inStock) return;

    setIsAdding(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      inStock: product.inStock ?? true,
      isPrime: product.isPrime,
      seller: product.seller,
    });

    setIsAdding(false);
    setJustAdded(true);
    
    // Call optional callback
    onAddToCart?.();
    
    // Auto-open cart sidebar
    setTimeout(() => {
      openCart();
    }, 100);

    // Reset "just added" state after animation
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  const buttonSize = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }[size];

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  }[size];

  if (!product.inStock) {
    return (
      <Button
        variant="outline"
        disabled
        className={cn(buttonSize, className)}
      >
        Out of Stock
      </Button>
    );
  }

  return (
    <Button
      variant={variant === 'default' ? 'default' : variant}
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className={cn(
        buttonSize,
        variant === 'default' && 'bg-tfm-navy hover:bg-tfm-navy-dark',
        justAdded && 'bg-green-600 hover:bg-green-700',
        'transition-all duration-300 relative overflow-hidden',
        className
      )}
    >
      <div className={cn(
        'flex items-center space-x-2 transition-all duration-300',
        isAdding && 'scale-95 opacity-70'
      )}>
        {showIcon && (
          <div className="relative">
            {justAdded ? (
              <Check className={cn(iconSize, 'animate-in zoom-in duration-300')} />
            ) : isAdding ? (
              <Plus className={cn(iconSize, 'animate-spin')} />
            ) : (
              <ShoppingCart className={iconSize} />
            )}
          </div>
        )}
        
        <span>
          {justAdded ? 'Added!' : isAdding ? 'Adding...' : 'Add to Cart'}
        </span>
      </div>
      
      {/* Success animation overlay */}
      {justAdded && (
        <div className="absolute inset-0 bg-green-500 opacity-20 animate-pulse" />
      )}
    </Button>
  );
}
