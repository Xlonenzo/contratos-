import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const IssueTooltip = ({ 
  position, 
  selectedText, 
  onSubmit, 
  onClose,
  buttonColor,
  existingIssue 
}) => {
  const [issueData, setIssueData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    issue_type: 'task'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...issueData,
      selection_text: selectedText,
      text_position: position
    });
  };

  return (
    <div 
      className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80"
      style={{
        top: position.y + window.scrollY + 20,
        left: position.x
      }}
    >
      {existingIssue ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle size={16} />
              Issue #{existingIssue.id}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
          
          <div>
            <h4 className="font-medium">{existingIssue.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{existingIssue.description}</p>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Prioridade: {existingIssue.priority}</span>
            <span className="text-gray-500">Tipo: {existingIssue.issue_type}</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle size={16} />
            Nova Issue
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Título
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:outline-none"
            value={issueData.title}
            onChange={(e) => setIssueData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Descrição
          </label>
          <textarea
            className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:outline-none"
            rows={3}
            value={issueData.description}
            onChange={(e) => setIssueData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Prioridade
            </label>
            <select
              className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:outline-none"
              value={issueData.priority}
              onChange={(e) => setIssueData(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Tipo
            </label>
            <select
              className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:outline-none"
              value={issueData.issue_type}
              onChange={(e) => setIssueData(prev => ({ ...prev, issue_type: e.target.value }))}
            >
              <option value="task">Tarefa</option>
              <option value="bug">Problema</option>
              <option value="improvement">Melhoria</option>
              <option value="question">Dúvida</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            style={{ backgroundColor: buttonColor }}
            className="px-4 py-2 text-sm font-medium text-white rounded hover:opacity-90"
          >
            Criar Issue
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueTooltip; 