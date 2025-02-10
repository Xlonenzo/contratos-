import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { 
  Plus, 
  Filter, 
  ChevronUp, 
  ChevronDown, 
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  AlertTriangle,
  HelpCircle,
  Type,
  BarChart2,
  FileText
} from 'lucide-react';

// Estilos base (mesmo do UserManagement)
const baseStyles = {
  input: "w-full px-3 py-2 text-base border rounded focus:ring-1 focus:outline-none transition-shadow",
  label: "block text-base font-medium text-gray-600 mb-1",
  headerButton: "px-3 py-1.5 text-base rounded-md flex items-center gap-1.5 transition-all",
  tableHeader: "px-3 py-2 text-base font-medium text-gray-600 border-b border-gray-100",
  tableCell: "px-3 py-2 text-base text-gray-800 border-b border-gray-100",
  filterLabel: "block text-base font-medium text-gray-600 mb-1",
  iconButton: "p-1 rounded-md hover:bg-gray-50 transition-colors"
};

// Colunas da tabela
const tableColumns = [
  { key: 'contractNumber', label: 'Contrato', sortable: true },
  { key: 'analysisType', label: 'Tipo', sortable: true },
  { key: 'riskScore', label: 'Risco', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdAt', label: 'Data', sortable: true },
  { key: 'actions', label: 'Ações', sortable: false }
];

// Informações de ajuda
const helpInfo = {
  title: "Análise de IA",
  description: "Esta página permite gerenciar análises de contratos usando inteligência artificial.",
  fields: [
    {
      name: "Contrato",
      description: "Contrato sendo analisado",
      example: "Ex: CTR-2024-001"
    },
    {
      name: "Tipo de Análise",
      description: "Tipo de análise realizada",
      options: [
        "Risco - Análise de riscos contratuais",
        "Compliance - Verificação de conformidade",
        "ESG - Análise de critérios ESG",
        "Financeira - Análise financeira"
      ]
    },
    {
      name: "Score de Risco",
      description: "Pontuação de risco calculada",
      options: [
        "Baixo - 0% a 30%",
        "Médio - 31% a 60%",
        "Alto - 61% a 80%",
        "Crítico - 81% a 100%"
      ]
    },
    {
      name: "Status",
      description: "Estado atual da análise",
      options: [
        "Em Andamento - Análise sendo processada",
        "Concluída - Análise finalizada",
        "Com Alertas - Pontos de atenção identificados",
        "Erro - Falha na análise"
      ]
    }
  ]
};

function AIAnalysisManagement({ buttonColor, isSidebarCollapsed }) {
  // Estados
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingAnalysis, setIsAddingAnalysis] = useState(false);
  const [viewingAnalysis, setViewingAnalysis] = useState(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Estados do formulário
  const [formData, setFormData] = useState({
    contractId: '',
    analysisType: 'risk',
    description: ''
  });

  // Filtros
  const [filters, setFilters] = useState({
    contractNumber: '',
    analysisType: '',
    status: ''
  });

  // Ordenação
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none'
  });

  // Buscar análises
  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await axios.get(`${API_URL}/ai-analysis`);
      setAnalyses(response.data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar análises:', err);
      setError('Erro ao carregar análises');
    } finally {
      setLoading(false);
    }
  };

  // ... resto do código seguindo a mesma estrutura do UserManagement
  // Incluindo funções de ordenação, filtro, paginação, etc.

  return (
    <div className={`fixed top-12 ${isSidebarCollapsed ? 'left-16' : 'left-64'} right-0 bottom-0 flex flex-col transition-all duration-300 bg-gray-100`}>
      {/* Header */}
      <div className="flex justify-between items-center h-14 bg-white border-b px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium">Análise de IA</h1>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-emerald-500 hover:text-emerald-600 transition-colors"
            title="Ajuda"
          >
            <HelpCircle size={18} className="stroke-[1.5]" />
          </button>
        </div>
        <button
          onClick={() => {
            setViewingAnalysis(null);
            setIsAddingAnalysis(true);
          }}
          style={{ backgroundColor: buttonColor }}
          className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          <Plus size={16} className="stroke-[1.5]" />
          Nova Análise
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-4 overflow-auto">
        {/* ... resto do JSX seguindo a mesma estrutura do UserManagement */}
      </div>
    </div>
  );
}

export default AIAnalysisManagement; 