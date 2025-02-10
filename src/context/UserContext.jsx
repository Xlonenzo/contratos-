import { createContext, useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { getCurrentUser } from '../services/auth';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: 'Admin',
    role: 'Administrador'
  });

  const { data: userQuery, isLoading } = useQuery(['user'], getCurrentUser, {
    enabled: !!localStorage.getItem('token'),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return (
    <UserContext.Provider value={{ user, setUser, userQuery, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
}; 