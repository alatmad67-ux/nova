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
  
  // Track current query to avoid stale subscription updates
  const activeQueryRef = useRef<Query | null>(null);

  useEffect(() => {
    // If no query, or it's the same query as before, don't re-subscribe
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
        // Ensure we only update state for the current active query
        if (activeQueryRef.current !== query) return;

        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(docs);
        setError(null);
        setLoading(false);
      },
      async (serverError: any) => {
        if (activeQueryRef.current !== query) return;

        let path = 'unknown';
        try {
          if (query instanceof CollectionReference) {
            path = query.path;
          } else if ('_query' in (query as any)) {
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
        }
        
        setError(serverError);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [query]); // Reference stability is handled via useMemo in pages

  return { data, loading, error };
}
