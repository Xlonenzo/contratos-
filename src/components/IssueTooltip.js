import React, { useState } from 'react';
import { X, AlertTriangle, Bookmark } from 'lucide-react';

const IssueTooltip = ({ position, selectedText, type, data, onSubmit, onClose }) => {
  const [title, setTitle] = useState(data?.title || '');
  const [description, setDescription] = useState(data?.description || '');
  const [priority, setPriority] = useState(data?.priority || 'medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      priority,
      selectedText
    });
  };

  return (
    <div 
      className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-80"
      style={{
        left: position.x,
        top: position.y + 8,
        transform: 'translateX(-50%)',
        maxWidth: 'calc(100% - 2rem)',
        margin: '0 1rem'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {type === 'issue' ? (
            <AlertTriangle className="text-red-500" size={18} />
          ) : (
            <Bookmark className="text-yellow-500" size={18} />
          )}
          <span className="font-medium">
            {type === 'issue' ? 'Nova Issue' : 'Novo Bookmark'}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="p-3">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:outline-none"
            placeholder={type === 'issue' ? 'Título da issue' : 'Título do bookmark'}
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:outline-none"
            rows={3}
            placeholder={type === 'issue' ? 'Descreva o problema...' : 'Adicione uma nota...'}
          />
        </div>

        {type === 'issue' && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:outline-none"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
        )}

        <div className="text-sm text-gray-500 mb-3">
          <strong>Texto selecionado:</strong>
          <div className="mt-1 p-2 bg-gray-50 rounded">
            {selectedText}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-3 py-1.5 text-sm text-white rounded ${
              type === 'issue' ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            {type === 'issue' ? 'Criar Issue' : 'Criar Bookmark'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueTooltip; 