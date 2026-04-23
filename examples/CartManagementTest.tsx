import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui/button';
import { useCartCombined, useClearCart } from '@/stores/cart';
import { useAuth } from '@/context/auth';

interface CartManagementTestProps {
  productId?: string;
  variantSku?: string;
}

export default function CartManagementTest({ 
  productId = "test-product-123", 
  variantSku = "test-variant-456" 
}: CartManagementTestProps) {
  const { user } = useAuth();
  const cart = useCartCombined(user?.user_id?.toString() ?? "");
  const clearCart = useClearCart();

  const testQuantity = cart.getTempQuantity(productId, variantSku);
  const cartQuantity = cart.getCartItemQuantity(productId, variantSku);
  const isInCart = cart.isInCart(productId, variantSku);

  const handleSetTempQuantity = () => {
    cart.setTempQuantity(productId, variantSku, 3);
  };

  const handleClearTempQuantity = () => {
    cart.clearTempQuantity(productId, variantSku);
  };

  const handleUpdateCartQuantity = () => {
    cart.updateCartItemQuantity(productId, variantSku, 5);
  };

  const handleAddToCart = async () => {
    if (cart.cart) {
      try {
        await cart.addItem({
          product_id: productId,
          quantity: 2,
          sku: variantSku,
        }, variantSku);
      } catch (error) {
        console.error('Failed to add item to cart:', error);
      }
    } else {
      console.log('No cart available');
    }
  };

  const handleBuyNow = async () => {
    if (cart.cart) {
      try {
        
        await cart.buyNow({
          product_id: productId,
          quantity: 1,
          sku: variantSku,
        }, variantSku);
      } catch (error) {
        console.error('Failed to process Buy Now:', error);
      }
    } else {
      console.log('No cart available for Buy Now');
    }
  };

  const handleRestoreCart = async () => {
    try {
      const restoredCart = await cart.restoreOriginalCart();
      if (restoredCart) {
        // console.log('Original cart restored successfully:', restoredCart);
      } else {
        // console.log('No temporary cart to restore');
      }
    } catch (error) {
      console.error('Failed to restore original cart:', error);
    }
  };

  const handleCheckTempCart = () => {
    const tempCart = cart.getTempCart();
    if (tempCart) {
      // console.log('Temporary cart found:', {
      //   cartId: tempCart.cart?.cart_id,
      //   itemCount: tempCart.cart?.items.length,
      //   timestamp: new Date(tempCart.timestamp).toLocaleString()
      // });
    } else {
      // console.log('No temporary cart found');
    }
  };

  const handleClearCart = async () => {
    if (cart.cart) {
      try {
        await clearCart.mutateAsync({
          cartId: cart.cart.cart_id,
        });
        // console.log('Cart cleared successfully');
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };

  return (
    <View className="p-4 space-y-4">
      <Text className="text-lg font-bold">Cart Management Test</Text>
      
      <View className="space-y-2">
        <Text>Product ID: {productId}</Text>
        <Text>Variant SKU: {variantSku}</Text>
        <Text>Temp Quantity: {testQuantity}</Text>
        <Text>Cart Quantity: {cartQuantity}</Text>
        <Text>Is in Cart: {isInCart ? 'Yes' : 'No'}</Text>
        <Text>Total Items: {cart.getTotalItemCount()}</Text>
      </View>

      <View className="space-y-2">
        <Button onPress={handleSetTempQuantity}>
          <Text>Set Temp Quantity to 3</Text>
        </Button>
        
        <Button onPress={handleClearTempQuantity}>
          <Text>Clear Temp Quantity</Text>
        </Button>
        
        <Button onPress={handleUpdateCartQuantity}>
          <Text>Update Cart Quantity to 5</Text>
        </Button>

        <Button 
          onPress={handleAddToCart}
          disabled={cart.addToCartMutation.isPending || !cart.cart}
        >
          <Text>{cart.addToCartMutation.isPending ? 'Adding...' : 'Add to Cart (2 items)'}</Text>
        </Button>

        <Button 
          onPress={handleBuyNow}
          disabled={!cart.cart}
        >
          <Text>Buy Now</Text>
        </Button>

        <Button 
          onPress={handleRestoreCart}
          disabled={!cart.cart}
        >
          <Text>Restore Original Cart</Text>
        </Button>

        <Button 
          onPress={handleCheckTempCart}
          disabled={!cart.cart}
        >
          <Text>Check Temporary Cart</Text>
        </Button>

        <Button 
          onPress={handleClearCart}
          disabled={clearCart.isPending || !cart.cart}
          variant="destructive"
        >
          <Text>{clearCart.isPending ? 'Clearing...' : 'Clear Cart'}</Text>
        </Button>
      </View>
    </View>
  );
} 