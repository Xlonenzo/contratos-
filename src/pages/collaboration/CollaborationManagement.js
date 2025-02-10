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
  MessageSquare,
  HelpCircle,
  Type,
  Users,
  ThumbsUp,
  Clock,
  Send
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
  { key: 'type', label: 'Tipo', sortable: true },
  { key: 'message', label: 'Mensagem', sortable: true },
  { key: 'author', label: 'Autor', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdAt', label: 'Data', sortable: true },
  { key: 'actions', label: 'Ações', sortable: false }
];

// Status das colaborações
const COLLABORATION_STATUS = {
  pending: {
    label: 'Pendente',
    color: 'yellow',
    icon: Clock
  },
  approved: {
    label: 'Aprovado',
    color: 'green',
    icon: ThumbsUp
  },
  in_discussion: {
    label: 'Em Discussão',
    color: 'blue',
    icon: MessageSquare
  }
};

// Tipos de colaboração
const COLLABORATION_TYPES = {
  comment: {
    label: 'Comentário',
    color: 'blue'
  },
  approval: {
    label: 'Aprovação',
    color: 'green'
  },
  review: {
    label: 'Revisão',
    color: 'orange'
  }
};

// Informações de ajuda
const helpInfo = {
  title: "Colaboração",
  description: "Esta página permite gerenciar comentários, aprovações e revisões de contratos.",
  fields: [
    {
      name: "Contrato",
      description: "Contrato relacionado",
      example: "Ex: CTR-2024-001"
    },
    {
      name: "Tipo",
      description: "Tipo de colaboração",
      options: [
        "Comentário - Observações gerais",
        "Aprovação - Solicitação de aprovação",
        "Revisão - Pedido de revisão"
      ]
    },
    {
      name: "Mensagem",
      description: "Conteúdo da colaboração",
      example: "Ex: Favor revisar a cláusula 4.2"
    },
    {
      name: "Status",
      description: "Estado atual",
      options: [
        "Pendente - Aguardando ação",
        "Aprovado - Colaboração aceita",
        "Em Discussão - Em debate"
      ]
    }
  ]
};

function CollaborationManagement({ buttonColor, isSidebarCollapsed }) {
  // Estados
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingCollaboration, setIsAddingCollaboration] = useState(false);
  const [viewingCollaboration, setViewingCollaboration] = useState(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Estados do formulário
  const [formData, setFormData] = useState({
    contractId: '',
    type: 'comment',
    message: '',
    status: 'pending'
  });

  // Filtros
  const [filters, setFilters] = useState({
    contractNumber: '',
    type: '',
    author: '',
    status: ''
  });

  // Ordenação
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none'
  });

  // Buscar colaborações
  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    try {
      const response = await axios.get(`${API_URL}/collaborations`);
      setCollaborations(response.data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar colaborações:', err);
      setError('Erro ao carregar colaborações');
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
          <h1 className="text-lg font-medium">Colaboração</h1>
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
            setViewingCollaboration(null);
            setIsAddingCollaboration(true);
          }}
          style={{ backgroundColor: buttonColor }}
          className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          <Plus size={16} className="stroke-[1.5]" />
          Nova Colaboração
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-4 overflow-auto">
        {/* ... resto do JSX seguindo a mesma estrutura do UserManagement */}
      </div>
    </div>
  );
}

export default CollaborationManagement; 