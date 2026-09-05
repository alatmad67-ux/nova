'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  DocumentReference, 
  onSnapshot, 
  DocumentSnapshot, 
  DocumentData 
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc(docRef: DocumentReference | null) {
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const isUnmounting = useRef(false);

  useEffect(() => {
    isUnmounting.current = false;

    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot) => {
        if (isUnmounting.current) return;
        const newData = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
        setData(newData);
        setLoading(false);
      },
      (serverError: any) => {
        if (isUnmounting.current) return;
        
        // Synchronous error handling to avoid ID: ca9 corruption
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => {
      isUnmounting.current = true;
      unsubscribe();
    };
  }, [docRef]);

  return { data, loading };
}