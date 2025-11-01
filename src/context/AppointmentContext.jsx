import React, { createContext, useContext, useReducer } from 'react';

const AppointmentContext = createContext();

const appointmentReducer = (state, action) => {
  switch (action.type) {
    case 'SET_APPOINTMENTS':
      return { ...state, appointments: action.payload };
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] };
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(apt =>
          apt.id === action.payload.id ? action.payload : apt
        )
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const initialState = {
  appointments: [],
  loading: false,
  selectedDate: new Date(),
  selectedPoliklinik: null
};

export const AppointmentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appointmentReducer, initialState);

  const addAppointment = (appointment) => {
    const newAppointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    dispatch({ type: 'ADD_APPOINTMENT', payload: newAppointment });
    return newAppointment;
  };

  const updateAppointment = (appointmentId, updates) => {
    dispatch({
      type: 'UPDATE_APPOINTMENT',
      payload: { id: appointmentId, ...updates }
    });
  };

  const value = {
    ...state,
    addAppointment,
    updateAppointment
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointment must be used within an AppointmentProvider');
  }
  return context;
};