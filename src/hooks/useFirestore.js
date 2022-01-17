import { useReducer, useEffect, useState } from 'react';
import { projectFirestore, timestamp } from '../firebase';

let initialState = {
  document: null,
  isPending: false,
  error: null,
  success: null,
};

const firestoreReducer = (state, action) => {
  switch (action.type) {
    case 'IS_PENDING':
      return { isPending: true, document: null, success: false, error: null };
    case 'ADDED_DOCUMENT':
      return { isPending: false, document: action.payload, success: true, error: null };
    case 'DELETED_DOCUMENT':
      return { isPending: false, document: null, success: true, error: null };
    case 'UPDATED_DOCUMENT':
      return { isPending: false, document: action.payload, success: true, error: null };
    case 'ERROR':
      return { isPending: false, document: null, success: false, error: action.payload };
    case 'CLEAR_RESPONSE':
      return { isPending: false, document: null, success: false, error: null };
    default:
      return state;
  }
};

export const useFirestore = (collection) => {
  const [response, dispatch] = useReducer(firestoreReducer, initialState);
  const [isCancelled, setIsCancelled] = useState(false);

  // collection ref
  const ref = projectFirestore.collection(collection);

  // only dispatch is not cancelled
  const dispatchIfNotCancelled = (action) => {
    if (!isCancelled) {
      dispatch(action);
    }
  };

  // add a document
  const addDocument = async (doc) => {
    dispatch({ type: 'IS_PENDING' });

    try {
      const createdAt = timestamp.fromDate(new Date());
      const addedDocument = await ref.add({ ...doc, createdAt });
      // id 필드를 추가함.
      await updateDocument(addedDocument.id, {
        id: addedDocument.id,
      });
      dispatchIfNotCancelled({ type: 'ADDED_DOCUMENT', payload: addedDocument });
    } catch (err) {
      dispatchIfNotCancelled({ type: 'ERROR', payload: err.message });
    }
  };

  // delete a document
  const deleteDocument = async (id) => {
    dispatch({ type: 'IS_PENDING' });

    try {
      await ref.doc(id).delete();
      dispatchIfNotCancelled({ type: 'DELETED_DOCUMENT' });
    } catch (err) {
      dispatchIfNotCancelled({ type: 'ERROR', payload: 'could not delete' });
    }
  };

  // update document
  const updateDocument = async (id, updates) => {
    dispatch({ type: 'IS_PENDING' });

    try {
      const updatedDocument = await ref.doc(id).update(updates);
      dispatchIfNotCancelled({ type: 'UPDATED_DOCUMENT', payload: updatedDocument });
      return updatedDocument;
    } catch (err) {
      dispatchIfNotCancelled({ type: 'ERROR', payload: err.message });
      return null;
    }
  };

  // search documents
  const searchDocuments = async (column, op, value) => {
    try {
      const foundDocuments = await ref.where(column, op, value).get();
      return foundDocuments;
    } catch (err) {
      dispatchIfNotCancelled({ type: 'ERROR', payload: err.message });
      return null;
    }
  };

  // search document only one
  const searchDocumentOnlyOne = async (column, op, value) => {
    try {
      const foundDocuments = await ref.where(column, op, value).get();
      if (foundDocuments.empty) {
        return null;
      }
      return foundDocuments.docs[0].data();
    } catch (err) {
      dispatchIfNotCancelled({ type: 'ERROR', payload: err.message });
      return null;
    }
  };

  // clear response
  const clearResponse = () => {
    dispatchIfNotCancelled({ type: 'CLEAR_RESPONSE' });
  };

  useEffect(() => {
    return () => setIsCancelled(true);
  }, []);

  return {
    addDocument,
    deleteDocument,
    updateDocument,
    searchDocuments,
    searchDocumentOnlyOne,
    clearResponse,
    response,
  };
};
