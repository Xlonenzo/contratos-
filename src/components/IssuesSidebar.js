import React from 'react';
import { MessageCircle, AlertTriangle, Brain } from 'lucide-react';

// Dados mockados mais relevantes para contratos
const MOCK_DATA = {
  comments: [
    {
      id: 1,
      text: "Cláusula 3.1 precisa ser mais específica quanto aos prazos de entrega",
      user: "Ana Silva",
      timestamp: "2024-02-20T10:30:00",
      type: "legal"
    },
    {
      id: 2,
      text: "Valores de multa precisam ser revisados conforme nova legislação",
      user: "Carlos Santos",
      timestamp: "2024-02-20T11:15:00",
      type: "financial"
    }
  ],
  issues: [
    {
      id: 1,
      title: "Risco Legal",
      text: "Cláusula de rescisão não contempla todos os cenários previstos na Lei 14.382",
      priority: "high",
      timestamp: "2024-02-20T09:45:00",
      status: "pending"
    },
    {
      id: 2,
      title: "Risco Financeiro",
      text: "Índice de reajuste não está alinhado com a política atual",
      priority: "medium",
      timestamp: "2024-02-20T15:30:00",
      status: "in_review"
    }
  ],
  aiAnalysis: [
    {
      id: 1,
      title: "Análise de Conformidade",
      text: "Identificados 3 pontos críticos de não conformidade com a legislação vigente",
      timestamp: "2024-02-20T14:20:00",
      riskLevel: "high",
      confidence: 0.89
    },
    {
      id: 2,
      title: "Análise de Riscos",
      text: "Sugestão de revisão das cláusulas 4.2 e 5.1 para mitigação de riscos",
      timestamp: "2024-02-20T16:45:00",
      riskLevel: "medium",
      confidence: 0.92
    }
  ]
};

const IssuesSidebar = () => {
  return (
    <div className="w-64 border-l border-gray-200 pl-4">
      <div className="space-y-6">
        {/* Seção de Issues */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="font-medium text-sm">Issues Identificadas</span>
            </div>
          </div>
          <div className="p-2 space-y-2">
            {MOCK_DATA.issues.map(issue => (
              <div key={issue.id} className="p-2 bg-gray-50 rounded hover:bg-gray-100">
                <div className="font-medium text-sm">{issue.title}</div>
                <p className="text-xs text-gray-600 mt-1">{issue.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    issue.priority === 'high' ? 'bg-red-100 text-red-700' : 
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {issue.priority === 'high' ? 'Alta' : 'Média'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(issue.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Comentários */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MessageCircle size={16} className="text-blue-500" />
              <span className="font-medium text-sm">Comentários</span>
            </div>
          </div>
          <div className="p-2 space-y-2">
            {MOCK_DATA.comments.map(comment => (
              <div key={comment.id} className="p-2 bg-gray-50 rounded hover:bg-gray-100">
                <p className="text-xs text-gray-600">{comment.text}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span className="font-medium">{comment.user}</span>
                  <span>•</span>
                  <span>{new Date(comment.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Análise IA */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-purple-500" />
              <span className="font-medium text-sm">Análise IA</span>
            </div>
          </div>
          <div className="p-2 space-y-2">
            {MOCK_DATA.aiAnalysis.map(analysis => (
              <div key={analysis.id} className="p-2 bg-gray-50 rounded hover:bg-gray-100">
                <div className="font-medium text-sm">{analysis.title}</div>
                <p className="text-xs text-gray-600 mt-1">{analysis.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    analysis.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    Risco {analysis.riskLevel === 'high' ? 'Alto' : 'Médio'}
                  </span>
                  <span className="text-xs text-gray-400">
                    Confiança: {(analysis.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuesSidebar; 