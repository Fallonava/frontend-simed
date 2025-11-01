import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { mockPoliklinikData } from '../services/mockData';

const PoliklinikContext = createContext();

const poliklinikReducer = (state, action) => {
  switch (action.type) {
    case 'SET_POLIKLINIK':
      return { ...state, poliklinik: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_POLIKLINIK':
      return {
        ...state,
        poliklinik: state.poliklinik.map(poli =>
          poli.id === action.payload.id ? { ...poli, ...action.payload } : poli
        )
      };
    default:
      return state;
  }
};

const initialState = {
  poliklinik: [],
  loading: true,
  error: null,
  lastUpdated: null
};

export const PoliklinikProvider = ({ children }) => {
  const [state, dispatch] = useReducer(poliklinikReducer, initialState);

  useEffect(() => {
    fetchPoliklinikData();
  }, []);

  const fetchPoliklinikData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Simulate API call
      setTimeout(() => {
        const updatedData = mockPoliklinikData.map(poli => ({
          ...poli,
          lastUpdated: new Date().toISOString()
        }));
        
        dispatch({ type: 'SET_POLIKLINIK', payload: updatedData });
      }, 1000);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updatePoliklinikStatus = (poliklinikId, updates) => {
    dispatch({
      type: 'UPDATE_POLIKLINIK',
      payload: { id: poliklinikId, ...updates }
    });
  };

  const refreshData = () => {
    fetchPoliklinikData();
  };

  const value = {
    ...state,
    refreshData,
    updatePoliklinikStatus
  };

  return (
    <PoliklinikContext.Provider value={value}>
      {children}
    </PoliklinikContext.Provider>
  );
};

export const usePoliklinik = () => {
  const context = useContext(PoliklinikContext);
  if (!context) {
    throw new Error('usePoliklinik must be used within a PoliklinikProvider');
  }
  return context;
};