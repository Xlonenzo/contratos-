// src/components/LoginPage.js

import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/login`, { 
        username, 
        password 
      });
      
      if (response.data && response.data.access_token) {
        // Garantir que o token seja salvo com o prefixo Bearer
        const token = `Bearer ${response.data.access_token}`;
        localStorage.setItem('token', token);
        
        // Configurar axios para usar o token em todas as requisições
        axios.defaults.headers.common['Authorization'] = token;
        
        onLogin({ 
          username: response.data.username, 
          role: response.data.role,
          access_token: response.data.access_token
        });
      } else {
        throw new Error('Token não recebido do servidor');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Erro ao fazer login';
      setError(errorMessage);
    }
  };

  const handleResetPassword = async () => {
    if (!username) {
      setError('Digite o nome de usuário para resetar a senha');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/reset-password/${username}`);
      setSuccessMessage('Senha resetada com sucesso para: admin123');
      setError('');
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.message || 
                         'Erro ao resetar senha';
      setError(errorMessage);
      setSuccessMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img 
            className="mx-auto h-24 w-auto" 
            src="/login.png" 
            alt="Logo" 
            onError={(e) => {
              e.target.onerror = null; // Previne loop infinito
              e.target.src = "/logo.png"; // Fallback para o logo padrão se login.png não existir
            }}
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Faça login na sua conta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-center">{error}</div>}
          {successMessage && <div className="text-green-500 text-center">{successMessage}</div>}
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Nome de usuário
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Entrar
            </button>
            
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-sm text-indigo-600 hover:text-indigo-500 text-center"
            >
              Resetar senha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
