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
  
  // Track active query to prevent setting state on stale listeners
  const activeQueryRef = useRef<Query | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      setLoading(false);
      setError(null);
      activeQueryRef.current = null;
      return;
    }

    activeQueryRef.current = query;
    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot) => {
        if (activeQueryRef.current !== query) return;

        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(docs);
        setError(null);
        setLoading(false);
      },
      (serverError: any) => {
        // MUST BE SYNCHRONOUS: async callbacks in onSnapshot error handling 
        // can lead to Firestore internal state corruption (ID: ca9)
        if (activeQueryRef.current !== query) return;

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

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
