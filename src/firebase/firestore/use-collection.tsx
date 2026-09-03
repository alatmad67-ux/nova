'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!query) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(docs);
        setError(null);
        setLoading(false);
      },
      async (serverError: any) => {
        // Safe path extraction to avoid client-side crash
        let path = 'unknown';
        try {
          if (query instanceof CollectionReference) {
            path = query.path;
          } else if ('_query' in (query as any)) {
            // Fallback for Query objects which might not expose path directly
            path = (query as any)._query?.path?.toString() || 'query';
          }
        } catch (e) {
          path = 'query-error';
        }
        
        if (serverError.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: path,
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        } else if (serverError.code === 'unavailable') {
          console.warn("Firestore connection unavailable. Using local cache.");
        }
        
        setError(serverError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
