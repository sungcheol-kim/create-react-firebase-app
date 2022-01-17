import { useEffect, useState, useRef } from 'react';
import { projectFirestore } from '../firebase';

export const useRealtimeCollection = (collection, _query = null, _orderBy = null) => {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState(null);

  // 객체의 경우 useRef를 사용하지 않으면 무한 루프에 빠지게 된다.
  // 어떤 변경으로 함수가 재호출 될 때마다 _query 와 _orderBy 주소가 변경되기 때문이다.
  const query = useRef(_query).current;
  const orderBy = useRef(_orderBy).current;

  useEffect(() => {
    let ref = projectFirestore.collection(collection);

    if (query) {
      ref = ref.where(...query);
    }
    if (orderBy) {
      ref = ref.orderBy(...orderBy);
    }

    const unsubscribe = ref.onSnapshot(
      (snapshot) => {
        let results = [];
        snapshot.docs.forEach((doc) => {
          results.push({ ...doc.data(), id: doc.id });
        });

        // update state
        setDocuments(results);
        setError(null);
      },
      (error) => {
        console.log(error);
        setError('could not fetch the data');
      }
    );

    // unsubscribe on unmount
    return () => unsubscribe();
  }, [collection, query, orderBy]);

  return { documents, error };
};
