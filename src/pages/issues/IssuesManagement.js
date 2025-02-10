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
  AlertTriangle,
  HelpCircle,
  Type,
  MessageSquare,
  CheckCircle,
  Clock
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
  { key: 'title', label: 'Título', sortable: true },
  { key: 'priority', label: 'Prioridade', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'assignedTo', label: 'Responsável', sortable: true },
  { key: 'createdAt', label: 'Data', sortable: true },
  { key: 'actions', label: 'Ações', sortable: false }
];

// Status das issues
const ISSUE_STATUS = {
  open: {
    label: 'Aberta',
    color: 'red',
    icon: AlertTriangle
  },
  in_review: {
    label: 'Em Revisão',
    color: 'yellow',
    icon: Clock
  },
  in_progress: {
    label: 'Em Andamento',
    color: 'blue',
    icon: MessageSquare
  },
  resolved: {
    label: 'Resolvida',
    color: 'green',
    icon: CheckCircle
  }
};

// Prioridades
const PRIORITIES = {
  low: {
    label: 'Baixa',
    color: 'green'
  },
  medium: {
    label: 'Média',
    color: 'yellow'
  },
  high: {
    label: 'Alta',
    color: 'orange'
  },
  critical: {
    label: 'Crítica',
    color: 'red'
  }
};

// Informações de ajuda
const helpInfo = {
  title: "Gestão de Issues",
  description: "Esta página permite gerenciar issues e pontos de atenção identificados nos contratos.",
  fields: [
    {
      name: "Contrato",
      description: "Contrato relacionado à issue",
      example: "Ex: CTR-2024-001"
    },
    {
      name: "Título",
      description: "Descrição curta da issue",
      example: "Ex: Cláusula 3.2 com risco legal"
    },
    {
      name: "Prioridade",
      description: "Nível de urgência da issue",
      options: [
        "Baixa - Pode ser tratada posteriormente",
        "Média - Requer atenção em breve",
        "Alta - Requer atenção imediata",
        "Crítica - Requer ação urgente"
      ]
    },
    {
      name: "Status",
      description: "Estado atual da issue",
      options: [
        "Aberta - Issue identificada",
        "Em Revisão - Sendo analisada",
        "Em Andamento - Sendo tratada",
        "Resolvida - Issue solucionada"
      ]
    },
    {
      name: "Responsável",
      description: "Pessoa designada para resolver",
      example: "Ex: João Silva"
    }
  ]
};

function IssuesManagement({ buttonColor, isSidebarCollapsed }) {
  // Estados
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingIssue, setIsAddingIssue] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Estados do formulário
  const [formData, setFormData] = useState({
    contractId: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    assignedTo: ''
  });

  // Filtros
  const [filters, setFilters] = useState({
    contractNumber: '',
    title: '',
    priority: '',
    status: '',
    assignedTo: ''
  });

  // Ordenação
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none'
  });

  // Buscar issues
  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await axios.get(`${API_URL}/issues`);
      setIssues(response.data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar issues:', err);
      setError('Erro ao carregar issues');
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
          <h1 className="text-lg font-medium">Gestão de Issues</h1>
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
            setEditingIssue(null);
            setIsAddingIssue(true);
          }}
          style={{ backgroundColor: buttonColor }}
          className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          <Plus size={16} className="stroke-[1.5]" />
          Nova Issue
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-4 overflow-auto">
        {/* ... resto do JSX seguindo a mesma estrutura do UserManagement */}
      </div>
    </div>
  );
}

export default IssuesManagement; 