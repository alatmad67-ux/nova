'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Query, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData,
  CollectionReference
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection(query: Query | null) {
  const [data, setData] = useState<DocumentData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const activeQueryRef = useRef<Query | null>(null);
  const isUnmounting = useRef(false);

  useEffect(() => {
    isUnmounting.current = false;
    
    if (!query) {
      setData(null);
      setLoading(false);
      setError(null);
      activeQueryRef.current = null;
      return;
    }

    activeQueryRef.current = query;
    setLoading(true);

    // CRITICAL: onSnapshot must be handled SYNCHRONOUSLY to prevent SDK state corruption (ID: ca9)
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot) => {
        if (isUnmounting.current || activeQueryRef.current !== query) return;

        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setData(docs);
        setError(null);
        setLoading(false);
      },
      (serverError: any) => {
        if (isUnmounting.current || activeQueryRef.current !== query) return;

        // Process error synchronously
        if (serverError.code === 'permission-denied') {
          let path = 'unknown';
          try {
            if (query instanceof CollectionReference) path = query.path;
            else if ('_query' in (query as any)) path = (query as any)._query?.path?.toString() || 'query';
          } catch (e) {}

          const permissionError = new FirestorePermissionError({
            path: path,
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
        
        setError(serverError);
        setLoading(false);
      }
    );

    return () => {
      isUnmounting.current = true;
      unsubscribe();
    };
  }, [query]);

  return { data, loading, error };
}