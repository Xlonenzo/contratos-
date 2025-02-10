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
  FileText,
  FileSearch,
  BarChart2,
  AlertTriangle,
  HelpCircle,
  Type,
  Pen,
  Trash
} from 'lucide-react';
import { CONTRACT_STATUS } from '../../data/menuItems';

// Estilos base
const baseStyles = {
  input: "w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:outline-none transition-shadow",
  label: "block text-sm font-medium text-gray-600 mb-1",
  headerButton: "px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 transition-all",
  tableHeader: "px-3 py-2 text-sm font-medium text-gray-600 border-b border-gray-100",
  tableCell: "px-3 py-2 text-sm text-gray-800 border-b border-gray-100",
  filterLabel: "block text-sm font-medium text-gray-600 mb-1",
  iconButton: "p-1 rounded-md hover:bg-gray-50 transition-colors"
};

// Colunas da tabela
const tableColumns = [
  { key: 'number', label: 'Número', sortable: true },
  { key: 'title', label: 'Título', sortable: true },
  { key: 'company', label: 'Empresa', sortable: true },
  { key: 'value', label: 'Valor', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Ações', sortable: false }
];

// Informações de ajuda
const helpInfo = {
  title: "Gestão de Contratos",
  description: "Esta página permite gerenciar contratos, incluindo criação, edição, análise e monitoramento.",
  fields: [
    {
      name: "Número",
      description: "Identificador único do contrato",
      example: "Ex: CTR-2024-001"
    },
    {
      name: "Título",
      description: "Nome descritivo do contrato",
      example: "Ex: Contrato de Prestação de Serviços"
    },
    {
      name: "Empresa",
      description: "Empresa contratada/contratante",
      example: "Ex: Empresa ABC Ltda"
    },
    {
      name: "Valor",
      description: "Valor total do contrato",
      example: "Ex: R$ 150.000,00"
    },
    {
      name: "Status",
      description: "Estado atual do contrato",
      options: [
        "Rascunho - Em elaboração",
        "Em Revisão - Aguardando aprovação",
        "Ativo - Contrato vigente",
        "Expirado - Prazo encerrado",
        "Terminado - Encerrado antes do prazo",
        "Arquivado - Contrato finalizado"
      ]
    },
    {
      name: "Risco",
      description: "Nível de risco calculado pela IA",
      options: [
        "Baixo - 0% a 30%",
        "Médio - 31% a 60%",
        "Alto - 61% a 80%",
        "Crítico - 81% a 100%"
      ]
    }
  ]
};

function ContractsManagement({ buttonColor, isSidebarCollapsed }) {
  // Estados
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingContract, setIsAddingContract] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Estados do formulário
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    company: '',
    value: '',
    startDate: '',
    endDate: '',
    status: 'draft',
    description: ''
  });

  // Filtros
  const [filters, setFilters] = useState({
    number: '',
    title: '',
    company: '',
    status: ''
  });

  // Ordenação
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none'
  });

  // Buscar contratos
  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      // Simular dados enquanto a API não está pronta
      const mockData = [
        {
          id: 1,
          number: 'CTR-2024-001',
          title: 'Contrato de Prestação de Serviços',
          company: 'Empresa ABC Ltda',
          value: 150000.00,
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        },
        // ... adicionar mais dados mock
      ];
      
      setContracts(mockData);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar contratos:', err);
      setError('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  // Função para filtrar contratos
  const filteredContracts = contracts.filter(contract => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      return contract[key]?.toLowerCase().includes(filters[key].toLowerCase());
    });
  });

  // Função para ordenação
  const handleSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = 'none';
      else if (sortConfig.direction === 'none') direction = 'asc';
    }
    
    setSortConfig({
      key,
      direction
    });
  };

  // Função para ordenar os dados
  const sortData = (data, key, direction) => {
    if (direction === 'none') return data;
    
    return [...data].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      
      let aValue = a[key];
      let bValue = b[key];
      
      // Tratamento especial para valores numéricos
      if (key === 'value' || key === 'riskScore') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      // Tratamento para strings
      else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Aplicar ordenação aos dados filtrados
  const sortedAndFilteredContracts = sortData(filteredContracts, sortConfig.key, sortConfig.direction);

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContracts = sortedAndFilteredContracts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className={`fixed top-12 ${isSidebarCollapsed ? 'left-16' : 'left-64'} right-0 bottom-0 flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className="flex justify-between items-center h-14 bg-white border-b px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium">Gestão de Contratos</h1>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Ajuda"
          >
            <HelpCircle size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingContract(true)}
            style={{ backgroundColor: buttonColor }}
            className="px-3 py-1.5 text-sm text-white rounded-md hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <Plus size={16} />
            Novo Contrato
          </button>

          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            style={{ color: buttonColor }}
            className="hover:text-gray-900 px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 hover:bg-gray-100 transition-colors"
          >
            <Filter size={16} />
            <span>Filtros</span>
            {isFilterExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-4 overflow-auto bg-gray-50">
        {/* Área de Filtros */}
        {isFilterExpanded && (
          <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={baseStyles.filterLabel}>Número</label>
                <input
                  type="text"
                  className={baseStyles.input}
                  value={filters.number}
                  onChange={(e) => setFilters(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="Buscar por número..."
                />
              </div>
              <div>
                <label className={baseStyles.filterLabel}>Título</label>
                <input
                  type="text"
                  className={baseStyles.input}
                  value={filters.title}
                  onChange={(e) => setFilters(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Buscar por título..."
                />
              </div>
              <div>
                <label className={baseStyles.filterLabel}>Empresa</label>
                <input
                  type="text"
                  className={baseStyles.input}
                  value={filters.company}
                  onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Buscar por empresa..."
                />
              </div>
              <div>
                <label className={baseStyles.filterLabel}>Status</label>
                <select
                  className={baseStyles.input}
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">Todos</option>
                  {Object.entries(CONTRACT_STATUS).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="w-full">
            <thead>
              <tr>
                {tableColumns.map(column => (
                  <th 
                    key={column.key}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                  >
                    <button
                      className="flex items-center gap-1 group"
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      {column.label}
                      {column.sortable && (
                        <span className="text-gray-400 group-hover:text-gray-600">
                          {sortConfig.key === column.key ? (
                            sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          ) : (
                            <ArrowUpDown size={14} />
                          )}
                        </span>
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-900">{contract.number}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{contract.title}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{contract.company}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(contract.value)}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${CONTRACT_STATUS[contract.status].color}-100 text-${CONTRACT_STATUS[contract.status].color}-800`}>
                      {CONTRACT_STATUS[contract.status].label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {/* Implementar edição */}}
                        className="text-gray-400 hover:text-gray-600"
                        title="Editar"
                      >
                        <Pen size={16} />
                      </button>
                      <button
                        onClick={() => {/* Implementar exclusão */}}
                        className="text-gray-400 hover:text-red-600"
                        title="Excluir"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {`${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredContracts.length)} de ${filteredContracts.length}`}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-gray-600 min-w-[3rem] text-center">
              {currentPage} / {Math.ceil(filteredContracts.length / itemsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredContracts.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filteredContracts.length / itemsPerPage)}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Ajuda - mesmo padrão do UserManagement */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{helpInfo.title}</h2>
              <button onClick={() => setShowHelp(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="prose prose-sm max-w-none">
              <p>{helpInfo.description}</p>
              <h3>Campos:</h3>
              <ul>
                {helpInfo.fields.map((field) => (
                  <li key={field.name}>
                    <strong>{field.name}:</strong> {field.description}
                    {field.example && <div className="text-gray-500">{field.example}</div>}
                    {field.options && (
                      <ul>
                        {field.options.map((option) => (
                          <li key={option}>{option}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractsManagement; 