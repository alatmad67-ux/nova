
'use client';

import { useEffect, useState } from 'react';
import { 
  Query, 
  onSnapshot, 
  QuerySnapshot, 
  DocumentData 
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection(query: Query | null) {
  const [data, setData] = useState<DocumentData[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
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
        setLoading(false);
      },
      async (serverError: any) => {
        // محاولة استخراج المسار من كائن الاستعلام لتوفير سياق أفضل لتصحيح الأخطاء
        const path = (query as any).path || (query as any)._query?.path?.segments?.join('/') || 'collection_query';
        
        const permissionError = new FirestorePermissionError({
          path: path,
          operation: 'list',
        });
        
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading };
}
