// src/components/Customization.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Palette, Type, HelpCircle } from 'lucide-react';

// Estilos base consistentes
const baseStyles = {
  input: "w-full px-3 py-2 text-base border rounded focus:ring-1 focus:outline-none transition-shadow",
  label: "block text-base font-medium text-gray-600 mb-1",
  headerButton: "px-3 py-1.5 text-base rounded-md flex items-center gap-1.5 transition-all",
  iconButton: "p-1 rounded-md hover:bg-gray-50 transition-colors"
};

function Customization({ customization: globalCustomization, setCustomization: setGlobalCustomization, isSidebarCollapsed }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localCustomization, setLocalCustomization] = useState(globalCustomization);

  const fetchCustomization = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/customization`);
      setLocalCustomization(response.data);
      setGlobalCustomization(response.data);
    } catch (error) {
      console.error('Erro ao buscar customização:', error);
      setError('Falha ao carregar as configurações');
    }
  }, [setGlobalCustomization]);

  useEffect(() => {
    fetchCustomization();
  }, [fetchCustomization]);

  useEffect(() => {
    setLocalCustomization(globalCustomization);
  }, [globalCustomization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await axios.put(`${API_URL}/customization`, {
        sidebar_color: localCustomization.sidebar_color || '#1a73e8',
        button_color: localCustomization.button_color || '#1a73e8',
        font_color: localCustomization.font_color || '#000000'
      });

      setLocalCustomization(response.data);
      setGlobalCustomization(response.data);
      setSuccess('Customização salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar customização:', error);
      setError('Falha ao salvar as configurações. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`
      fixed
      top-12
      ${isSidebarCollapsed ? 'left-16' : 'left-64'}
      right-0
      bottom-0
      flex
      flex-col
      transition-all 
      duration-300 
      bg-gray-100
    `}>
      {/* Header */}
      <div className="flex justify-between items-center h-14 bg-white border-b px-4 flex-shrink-0">
        <h1 className="text-lg font-medium">Customização</h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-6">
            {/* Cores */}
            <div>
              <h2 className="text-lg font-medium mb-4">Cores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cor da Sidebar */}
                <div>
                  <label className={baseStyles.label}>
                    Cor da Sidebar
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={localCustomization.sidebar_color || '#1a73e8'}
                      onChange={(e) => setLocalCustomization({...localCustomization, sidebar_color: e.target.value})}
                      className={baseStyles.input}
                    />
                    <input
                      type="color"
                      value={localCustomization.sidebar_color || '#1a73e8'}
                      onChange={(e) => setLocalCustomization({...localCustomization, sidebar_color: e.target.value})}
                      className="w-10 h-10 p-1 rounded border"
                    />
                  </div>
                </div>

                {/* Cor dos Botões */}
                <div>
                  <label className={baseStyles.label}>
                    Cor dos Botões
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={localCustomization.button_color || '#1a73e8'}
                      onChange={(e) => setLocalCustomization({...localCustomization, button_color: e.target.value})}
                      className={baseStyles.input}
                    />
                    <input
                      type="color"
                      value={localCustomization.button_color || '#1a73e8'}
                      onChange={(e) => setLocalCustomization({...localCustomization, button_color: e.target.value})}
                      className="w-10 h-10 p-1 rounded border"
                    />
                  </div>
                </div>

                {/* Cor da Fonte */}
                <div>
                  <label className={baseStyles.label}>
                    Cor da Fonte
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={localCustomization.font_color || '#000000'}
                      onChange={(e) => setLocalCustomization({...localCustomization, font_color: e.target.value})}
                      className={baseStyles.input}
                    />
                    <input
                      type="color"
                      value={localCustomization.font_color || '#000000'}
                      onChange={(e) => setLocalCustomization({...localCustomization, font_color: e.target.value})}
                      className="w-10 h-10 p-1 rounded border"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div>
              <h2 className="text-lg font-medium mb-4">Logo</h2>
              <div className="space-y-4">
                <div>
                  <label className={baseStyles.label}>
                    Upload de Logo
                  </label>
                  <input
                    type="file"
                    onChange={() => {}} // Adicionar lógica para upload de logo
                    accept="image/*"
                    className={`${baseStyles.input} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}
                  />
                </div>

                {/* Preview do Logo */}
                {localCustomization.logo && (
                  <div className="mt-4">
                    <label className={baseStyles.label}>Preview</label>
                    <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                      <img
                        src={localCustomization.logo}
                        alt="Logo preview"
                        className="max-h-32 mx-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={() => {}} // Adicionar lógica para resetar customização
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Resetar
              </button>
              <button
                onClick={handleSubmit}
                style={{ backgroundColor: localCustomization.button_color || '#1a73e8' }}
                className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity"
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Customization;
