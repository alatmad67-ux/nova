
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
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

  // Cart Persistence (Local Storage as primary for cart contents)
  useEffect(() => {
    const savedCart = localStorage.getItem('nova_cart_v2');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('nova_cart_v2', JSON.stringify(cart));
  }, [cart]);

  // Favorites Sync (Firestore for Auth Users)
  useEffect(() => {
    if (!db || !user) {
      const savedFavs = localStorage.getItem('nova_favs');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      return;
    }

    const favsRef = collection(db, 'users', user.uid, 'favorites');
    const unsubscribe = onSnapshot(favsRef, (snap) => {
      const ids = snap.docs.map(d => d.id);
      setFavorites(ids);
      localStorage.setItem('nova_favs', JSON.stringify(ids));
    }, (err) => {
      if (err.code !== 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: favsRef.path, operation: 'list' }));
      }
    });

    return () => unsubscribe();
  }, [db, user]);

  const addToCart = (newItem: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.variant.sku === newItem.variant.sku);
      if (existing) {
        return prev.map(i => i.variant.sku === newItem.variant.sku ? { ...i, quantity: i.quantity + 1 } : i);
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

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast({ title: "تنبيه", description: "يرجى تسجيل الدخول لحفظ المفضلات سحابياً" });
      const next = favorites.includes(productId) ? favorites.filter(id => id !== productId) : [...favorites, productId];
      setFavorites(next);
      localStorage.setItem('nova_favs', JSON.stringify(next));
      return;
    }

    if (!db) return;
    const favRef = doc(db, 'users', user.uid, 'favorites', productId);
    
    try {
      if (favorites.includes(productId)) {
        await deleteDoc(favRef);
      } else {
        await setDoc(favRef, { createdAt: serverTimestamp() });
      }
    } catch (e) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: favRef.path, operation: 'write' }));
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
