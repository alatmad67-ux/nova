'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  variant: {
    color: string;
    size: string;
    sku: string;
  };
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  favorites: string[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (sku: string) => void;
  updateQuantity: (sku: string, delta: number) => void;
  toggleFavorite: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const db = useFirestore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Local Storage for Cart (Standard behavior)
  useEffect(() => {
    const savedCart = localStorage.getItem('nova_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('nova_cart', JSON.stringify(cart));
  }, [cart]);

  // Firestore Sync for Favorites
  useEffect(() => {
    if (!db || !user) {
      // If no user, fallback to local storage for guest favorites
      const savedFavs = localStorage.getItem('nova_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      return;
    }

    // Real-time listener for user favorites in Firestore
    const favsRef = collection(db, 'users', user.uid, 'favorites');
    const unsubscribe = onSnapshot(
      favsRef, 
      (snapshot) => {
        const favIds = snapshot.docs.map(doc => doc.id);
        setFavorites(favIds);
        localStorage.setItem('nova_favorites', JSON.stringify(favIds));
      },
      (serverError: any) => {
        // Emit rich contextual error for favorites listener
        const permissionError = new FirestorePermissionError({
          path: favsRef.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [db, user]);

  const addToCart = (newItem: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.variant.sku === newItem.variant.sku);
      if (existing) {
        return prev.map(i => i.variant.sku === newItem.variant.sku ? { ...i, quantity: i.quantity + newItem.quantity } : i);
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (sku: string) => {
    setCart(prev => prev.filter(i => i.variant.sku !== sku));
  };

  const updateQuantity = (sku: string, delta: number) => {
    setCart(prev => prev.map(i => 
      i.variant.sku === sku ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
    ));
  };

  const toggleFavorite = async (id: string) => {
    if (!user) {
      toast({ title: "تنبيه", description: "يرجى تسجيل الدخول لحفظ المفضلات سحابياً" });
      setFavorites(prev => {
        const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
        localStorage.setItem('nova_favorites', JSON.stringify(next));
        return next;
      });
      return;
    }

    if (!db) return;
    const favRef = doc(db, 'users', user.uid, 'favorites', id);
    
    if (favorites.includes(id)) {
      deleteDoc(favRef).catch((e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: favRef.path, operation: 'delete' }));
      });
    } else {
      setDoc(favRef, { createdAt: new Date().toISOString() }).catch((e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: favRef.path, operation: 'create' }));
      });
    }
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, favorites, addToCart, removeFromCart, updateQuantity, toggleFavorite, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
