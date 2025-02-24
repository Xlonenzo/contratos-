import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Trash,
  MessageSquare,
  Bot,
  History,
  Bookmark,
  MessageCircle
} from 'lucide-react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import IssueTooltip from '../../components/IssueTooltip';
import { toast } from 'react-hot-toast';
import CustomQuill from '../../components/CustomQuill';
import IssuesSidebar from '../../components/IssuesSidebar';
import CustomEditor from '../../components/CustomEditor';

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

// Colunas da tabela atualizadas conforme banco de dados
const tableColumns = [
  { key: 'contract_number', label: 'Número', sortable: true },
  { key: 'contract_name', label: 'Nome', sortable: true },
  { key: 'contract_type', label: 'Tipo', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'effective_date', label: 'Data Início', sortable: true },
  { key: 'expiration_date', label: 'Data Fim', sortable: true },
  { key: 'actions', label: 'Ações', sortable: false }
];

// Status dos contratos conforme banco
const CONTRACT_STATUS = {
  active: {
    label: 'Ativo',
    color: 'green'
  },
  pending: {
    label: 'Pendente',
    color: 'yellow'
  },
  expired: {
    label: 'Expirado',
    color: 'red'
  },
  terminated: {
    label: 'Terminado',
    color: 'gray'
  }
};

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

// Adicione esta função de formatação de CPF
const formatCPF = (cpf) => {
  if (!cpf) return '';
  // Remove caracteres não numéricos
  const numbers = cpf.replace(/\D/g, '');
  // Aplica a máscara
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

function ContractsManagement({ buttonColor, isSidebarCollapsed }) {
  // Estados
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingContract, setEditingContract] = useState(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Estado inicial do formulário
  const initialFormState = {
    contract_number: '',
    contract_name: '',
    contract_type: '',
    contract_category: '',
    status: 'pending',
    party_a_type: 'company',  // Default como empresa
    party_b_type: 'company',  // Default como empresa
    party_a_id: '',
    party_b_id: '',
    party_a_role: '',
    party_b_role: '',
    effective_date: '',
    expiration_date: '',
    renewal_terms: '',
    payment_terms: '',
    escalation_clauses: '',
    document_url: ''
  };

  // Use o initialFormState no useState
  const [formData, setFormData] = useState(initialFormState);

  // Filtros atualizados
  const [filters, setFilters] = useState({
    contract_number: '',
    contract_name: '',
    contract_type: '',
    status: ''
  });

  // Ordenação
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none'
  });

  // Remover showContractModal e usar isAddingContract
  const [isAddingContract, setIsAddingContract] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [individuals, setIndividuals] = useState([]);

  // Trocar activeTab por activePage
  const [activePage, setActivePage] = useState('data'); // 'data' ou 'document'

  // Novos estados para o editor e funcionalidades
  const [contractText, setContractText] = useState('');
  const [comments, setComments] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [issues, setIssues] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [tooltipType, setTooltipType] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [editorValue, setEditorValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]);

  // Configuração do editor
  const editorModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['clean']
    ],
    history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true
    }
  };

  // Novo estado para o ref do CustomQuill
  const quillRef = useRef(null);

  // Adicione esta função no início do componente
  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token não encontrado');
      return null;
    }
    return token;
  };

  // Modifique as funções de fetch
  const fetchEmpresas = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      console.log('Token sendo enviado:', token); // Debug

      const response = await axios.get(`${API_URL}/empresas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Resposta da API (empresas):', response); // Debug
      setEmpresas(response.data);
    } catch (err) {
      console.error('Erro completo ao buscar empresas:', err); // Debug completo
      if (err.response?.status === 401) {
        localStorage.removeItem('token'); // Limpar token inválido
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/login';
      } else {
        toast.error('Erro ao carregar empresas');
      }
    }
  };

  const fetchIndividuals = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      console.log('Token sendo enviado:', token); // Debug

      const response = await axios.get(`${API_URL}/individuos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Resposta da API (indivíduos):', response); // Debug
      setIndividuals(response.data);
    } catch (err) {
      console.error('Erro completo ao buscar indivíduos:', err); // Debug completo
      if (err.response?.status === 401) {
        localStorage.removeItem('token'); // Limpar token inválido
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/login';
      } else {
        toast.error('Erro ao carregar indivíduos');
      }
    }
  };

  // Buscar contratos com a nova estrutura
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/login';
        return;
      }

      console.log('Buscando contratos...'); // Debug
      const response = await axios.get(`${API_URL}/contracts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Resposta da API:', response.data); // Debug
      
      if (Array.isArray(response.data)) {
        setContracts(response.data);
      } else if (response.data.contracts) {
        setContracts(response.data.contracts);
      } else {
        console.error('Formato de resposta inesperado:', response.data);
        toast.error('Erro no formato dos dados recebidos');
      }
      
      setError('');
    } catch (err) {
      console.error('Erro detalhado ao buscar contratos:', err);
      const errorMessage = err.response?.data?.detail || 'Erro ao carregar contratos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Adicione um useEffect para buscar os contratos quando o componente montar
  useEffect(() => {
    fetchContracts();
  }, []); // Array vazio significa que só executa uma vez ao montar

  // Modifique o useEffect para carregar os dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Buscar indivíduos
        const indResponse = await axios.get(`${API_URL}/individuos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Indivíduos carregados:', indResponse.data);
        setIndividuals(indResponse.data);

      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        if (err.response?.status === 401) {
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          window.location.href = '/login';
        } else {
          toast.error('Erro ao carregar dados');
        }
      }
    };

    if (isAddingContract) {
      fetchData();
    }
  }, [isAddingContract]);

  // Modifique o outro useEffect também
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    if (isAddingContract || editingContract) {
      fetchEmpresas();
      fetchIndividuals();
    }
  }, [isAddingContract, editingContract]);

  // Adicione uma função para resetar o formulário
  const resetForm = () => {
    setFormData(initialFormState);
    setEditorValue([{ type: 'paragraph', children: [{ text: '' }] }]);
    setActivePage('data');
  };

  // Modifique a função handleCreateContract
  const handleCreateContract = async (e) => {
    e.preventDefault();
    console.log('Iniciando criação do contrato');

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/login';
        return;
      }

      // Preparar dados para envio
      const contractData = {
        contract_number: formData.contract_number.trim(),
        contract_name: formData.contract_name.trim(),
        contract_type: formData.contract_type,
        contract_category: formData.contract_category,
        status: 'pending',
        party_a_id: Number(formData.party_a_id) || null,
        party_b_id: Number(formData.party_b_id) || null,
        party_a_role: formData.party_a_role?.trim() || null,
        party_b_role: formData.party_b_role?.trim() || null,
        effective_date: formData.effective_date,
        expiration_date: formData.expiration_date,
        renewal_terms: formData.renewal_terms?.trim() || null,
        payment_terms: formData.payment_terms?.trim() || null,
        escalation_clauses: formData.escalation_clauses?.trim() || null,
        document_content: editorValue ? JSON.stringify(editorValue) : null
      };

      console.log('Dados do contrato a serem enviados:', contractData);

      const response = await axios.post(
        `${API_URL}/contracts`, 
        contractData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Contrato criado:', response.data);
      toast.success('Contrato criado com sucesso!');
      setIsAddingContract(false);
      resetForm();  // Reseta o formulário
      fetchContracts();

    } catch (err) {
      console.error('Erro ao criar contrato:', err);
      console.error('Detalhes do erro:', err.response?.data);
      toast.error(err.response?.data?.detail || 'Erro ao criar contrato');
    }
  };

  // Função para filtrar contratos
  const filteredContracts = contracts.filter(contract => 
    Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      return contract[key]?.toLowerCase().includes(filters[key].toLowerCase());
    })
  );

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

  // Função para adicionar comentário
  const handleAddComment = async () => {
    try {
      const response = await axios.post(`${API_URL}/contracts/${editingContract?.id}/comments`, {
        text: commentText,
        selection: selectedText,
        position: { /* dados da posição do texto selecionado */ }
      });
      setComments([...comments, response.data]);
      setCommentText('');
      setShowCommentForm(false);
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err);
    }
  };

  // Função para solicitar análise da IA
  const handleAIAnalysis = async () => {
    try {
      const response = await axios.post(`${API_URL}/contracts/${editingContract?.id}/ai-analysis`, {
        text: contractText
      });
      setAiAnalysis(response.data);
    } catch (err) {
      console.error('Erro na análise de IA:', err);
    }
  };

  // Handler para seleção de texto
  const handleTextSelection = useCallback((range) => {
    if (!range) return;
    setSelectedRange(range);
  }, []);

  // Handler para clique em issues/bookmarks
  const handleIssueClick = useCallback((issueId, position, type) => {
    if (!quillRef.current) return;
    
    setTooltipPosition(position);
    setSelectedText(quillRef.current.getEditor().getText(
      position.index,
      position.length
    ));
    setTooltipType(type);
  }, []);

  const handleTooltipClose = () => {
    if (!quillRef.current || !selectedRange) return;
    
    const quill = quillRef.current.getEditor();
    quill.removeFormat(selectedRange.index, selectedRange.length);
    
    setTooltipPosition(null);
    setSelectedText('');
    setTooltipType(null);
    setSelectedRange(null);
  };

  // Handler para criar bookmark
  const handleCreateBookmark = async (bookmarkData) => {
    try {
      if (!quillRef.current || !selectedRange) return;

      const quill = quillRef.current.getEditor();
      quill.formatText(selectedRange.index, selectedRange.length, {
        'bookmark': true
      });

      // Aqui você pode adicionar a lógica para salvar o bookmark no backend
      
      setTooltipPosition(null);
      setSelectedRange(null);
      toast.success('Bookmark criado com sucesso!');
    } catch (err) {
      console.error('Erro ao criar bookmark:', err);
      toast.error('Erro ao criar bookmark');
    }
  };

  // Função atualizada para criar issue
  const handleCreateIssue = async (issueData) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API_URL}/contracts/${editingContract.id}/issues`,
        issueData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Aplicar highlight ao texto selecionado
      applyIssueHighlight(response.data.id);

      // Atualizar a lista de issues
      setIssues(prev => [...prev, response.data]);
      setTooltipPosition(null);
      
      toast.success('Issue criada com sucesso!');
    } catch (err) {
      console.error('Erro ao criar issue:', err);
      toast.error('Erro ao criar issue');
    }
  };

  // Função para aplicar highlight ao criar issue
  const applyIssueHighlight = (issueId) => {
    const quill = quillRef.current.getEditor();
    const selection = quill.getSelection();
    if (selection) {
      quill.formatText(selection.index, selection.length, {
        'issue': { id: issueId }
      });
    }
  };

  // Handler para mudanças no editor com validação
  const handleEditorChange = useCallback((newValue) => {
    if (newValue && Array.isArray(newValue) && newValue.length > 0) {
      setEditorValue(newValue);
    }
  }, []);

  // Handler para cliques em marcações
  const handleMarkClick = useCallback((type, range) => {
    if (!range) return;

    setTooltipPosition({
      x: range.getBoundingClientRect().left,
      y: range.getBoundingClientRect().bottom,
      index: range.anchor.offset,
      length: range.focus.offset - range.anchor.offset
    });
    setTooltipType(type);
  }, []);

  // Adicione no início do componente, logo após as declarações de estado
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token atual no localStorage:', token);
    
    // Tentar decodificar o token (se for um JWT)
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        console.log('Token decodificado:', payload);
      } catch (e) {
        console.log('Token não é um JWT válido');
      }
    }
  }, []);

  // Adicione logo após a definição do estado contracts
  useEffect(() => {
    // Dados mockados para teste
    const mockContracts = [
      {
        id: 1,
        contract_number: 'CTR-2024-001',
        contract_name: 'Contrato Teste',
        contract_type: 'service',
        status: 'active',
        effective_date: '2024-01-01',
        expiration_date: '2024-12-31'
      }
    ];
    
    // Comente esta linha após confirmar que o componente está funcionando
    setContracts(mockContracts);
  }, []);

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
            onClick={() => {
              resetForm();
              setIsAddingContract(true);
            }}
            style={{ backgroundColor: buttonColor }}
            className={baseStyles.headerButton}
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
        {isAddingContract ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleCreateContract}>
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    type="button"
                    onClick={() => setActivePage('data')}
                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                      activePage === 'data'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Dados Básicos
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePage('parties')}
                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                      activePage === 'parties'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Partes
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePage('document')}
                    className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                      activePage === 'document'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Documento
                  </button>
                </nav>
              </div>

              {/* Conteúdo */}
              <div className="p-6">
                {activePage === 'data' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Informações Básicas */}
                      <div>
                        <label className={baseStyles.label}>Número do Contrato</label>
                        <input
                          type="text"
                          required
                          className={baseStyles.input}
                          value={formData.contract_number}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            contract_number: e.target.value
                          }))}
                        />
                      </div>

                      <div>
                        <label className={baseStyles.label}>Nome do Contrato</label>
                        <input
                          type="text"
                          required
                          className={baseStyles.input}
                          value={formData.contract_name}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            contract_name: e.target.value
                          }))}
                        />
                      </div>

                      <div>
                        <label className={baseStyles.label}>Tipo de Contrato</label>
                        <select
                          required
                          className={baseStyles.input}
                          value={formData.contract_type}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            contract_type: e.target.value
                          }))}
                        >
                          <option value="">Selecione...</option>
                          <option value="service">Serviço</option>
                          <option value="supply">Fornecimento</option>
                          <option value="nda">NDA</option>
                        </select>
                      </div>

                      <div>
                        <label className={baseStyles.label}>Categoria</label>
                        <select
                          required
                          className={baseStyles.input}
                          value={formData.contract_category}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            contract_category: e.target.value
                          }))}
                        >
                          <option value="">Selecione...</option>
                          <option value="financial">Financeiro</option>
                          <option value="legal">Legal</option>
                          <option value="operational">Operacional</option>
                        </select>
                      </div>

                      {/* Datas */}
                      <div>
                        <label className={baseStyles.label}>Data de Início</label>
                        <input
                          type="date"
                          required
                          className={baseStyles.input}
                          value={formData.effective_date}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            effective_date: e.target.value
                          }))}
                        />
                      </div>

                      <div>
                        <label className={baseStyles.label}>Data de Término</label>
                        <input
                          type="date"
                          required
                          className={baseStyles.input}
                          value={formData.expiration_date}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            expiration_date: e.target.value
                          }))}
                        />
                      </div>
                    </div>

                    {/* Termos e Condições */}
                    <div className="space-y-4">
                      <div>
                        <label className={baseStyles.label}>Termos de Renovação</label>
                        <textarea
                          className={baseStyles.input}
                          value={formData.renewal_terms}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            renewal_terms: e.target.value
                          }))}
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className={baseStyles.label}>Termos de Pagamento</label>
                        <textarea
                          className={baseStyles.input}
                          value={formData.payment_terms}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            payment_terms: e.target.value
                          }))}
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className={baseStyles.label}>Cláusulas de Escalação</label>
                        <textarea
                          className={baseStyles.input}
                          value={formData.escalation_clauses}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            escalation_clauses: e.target.value
                          }))}
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingContract(false);
                          setEditingContract(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePage('parties')}
                        style={{ backgroundColor: buttonColor }}
                        className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90"
                      >
                        Próximo
                      </button>
                    </div>
                  </div>
                ) : activePage === 'parties' ? (
                  <div className="space-y-6">
                    {/* Parte A */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Parte A</h3>
                      <div className="space-y-4">
                        <div>
                          <label className={baseStyles.label}>Tipo</label>
                          <select
                            className={baseStyles.input}
                            value={formData.party_a_type}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              party_a_type: e.target.value,
                              party_a_id: '',
                              party_a_role: ''
                            }))}
                          >
                            <option value="company">Empresa</option>
                            <option value="individual">Indivíduo</option>
                          </select>
                        </div>

                        {formData.party_a_type === 'company' ? (
                          <div>
                            <label className={baseStyles.label}>Empresa</label>
                            <select
                              required
                              className={baseStyles.input}
                              value={formData.party_a_id}
                              onChange={(e) => {
                                const value = e.target.value;
                                console.log('Selecionando empresa A:', value);
                                setFormData(prev => ({
                                  ...prev,
                                  party_a_id: value ? Number(value) : ''
                                }));
                              }}
                            >
                              <option value="">Selecione uma empresa...</option>
                              {empresas?.map(empresa => (
                                <option key={empresa.id} value={empresa.id}>
                                  {empresa.razaoSocial} - {empresa.cnpj}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className={baseStyles.label}>Indivíduo</label>
                            <select
                              required
                              className={baseStyles.input}
                              value={formData.party_a_role}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                party_a_role: e.target.value
                              }))}
                            >
                              <option value="">Selecione um indivíduo...</option>
                              {individuals?.map(individual => (
                                <option key={individual.id} value={individual.role}>
                                  {`${individual.nome} - CPF: ${formatCPF(individual.cpf)}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Parte B */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Parte B</h3>
                      <div className="space-y-4">
                        <div>
                          <label className={baseStyles.label}>Tipo</label>
                          <select
                            className={baseStyles.input}
                            value={formData.party_b_type}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              party_b_type: e.target.value,
                              party_b_id: '',
                              party_b_role: ''
                            }))}
                          >
                            <option value="company">Empresa</option>
                            <option value="individual">Indivíduo</option>
                          </select>
                        </div>

                        {formData.party_b_type === 'company' ? (
                          <div>
                            <label className={baseStyles.label}>Empresa</label>
                            <select
                              required
                              className={baseStyles.input}
                              value={formData.party_b_id}
                              onChange={(e) => {
                                const value = e.target.value;
                                console.log('Selecionando empresa B:', value);
                                setFormData(prev => ({
                                  ...prev,
                                  party_b_id: value ? Number(value) : ''
                                }));
                              }}
                            >
                              <option value="">Selecione uma empresa...</option>
                              {empresas?.map(empresa => (
                                <option key={empresa.id} value={empresa.id}>
                                  {empresa.razaoSocial} - {empresa.cnpj}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className={baseStyles.label}>Indivíduo</label>
                            <select
                              required
                              className={baseStyles.input}
                              value={formData.party_b_role}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                party_b_role: e.target.value
                              }))}
                            >
                              <option value="">Selecione um indivíduo...</option>
                              {individuals?.map(individual => (
                                <option key={individual.id} value={individual.role}>
                                  {`${individual.nome} - CPF: ${formatCPF(individual.cpf)}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setActivePage('data')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePage('document')}
                        style={{ backgroundColor: buttonColor }}
                        className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90"
                      >
                        Próximo
                      </button>
                    </div>
                  </div>
                ) : activePage === 'document' ? (
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      {/* Editor */}
                      <div className="flex-1 relative">
                        <CustomEditor
                          value={editorValue}
                          onChange={handleEditorChange}
                          onMarkClick={handleMarkClick}
                        />
                        
                        {tooltipPosition && (
                          <IssueTooltip
                            position={tooltipPosition}
                            selectedText={selectedText}
                            onSubmit={tooltipType === 'issue' ? handleCreateIssue : handleCreateBookmark}
                            onClose={handleTooltipClose}
                            buttonColor={buttonColor}
                            type={tooltipType}
                            existingIssue={tooltipType === 'issue' && tooltipPosition.issueId ? 
                              issues.find(i => i.id === tooltipPosition.issueId) : null}
                          />
                        )}
                      </div>

                      {/* Barra lateral */}
                      <IssuesSidebar />
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setActivePage('parties')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateContract}
                        style={{ backgroundColor: buttonColor }}
                        className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90"
                      >
                        Salvar Contrato
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Área de Filtros */}
            {isFilterExpanded && (
              <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={baseStyles.filterLabel}>Número</label>
                    <input
                      type="text"
                      className={baseStyles.input}
                      value={filters.contract_number}
                      onChange={(e) => setFilters(prev => ({ ...prev, contract_number: e.target.value }))}
                      placeholder="Buscar por número..."
                    />
                  </div>
                  <div>
                    <label className={baseStyles.filterLabel}>Nome</label>
                    <input
                      type="text"
                      className={baseStyles.input}
                      value={filters.contract_name}
                      onChange={(e) => setFilters(prev => ({ ...prev, contract_name: e.target.value }))}
                      placeholder="Buscar por nome..."
                    />
                  </div>
                  <div>
                    <label className={baseStyles.filterLabel}>Tipo</label>
                    <input
                      type="text"
                      className={baseStyles.input}
                      value={filters.contract_type}
                      onChange={(e) => setFilters(prev => ({ ...prev, contract_type: e.target.value }))}
                      placeholder="Buscar por tipo..."
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
              {loading ? (
                <div className="p-4 text-center text-gray-600">
                  Carregando contratos...
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-600">
                  {error}
                </div>
              ) : currentContracts.length === 0 ? (
                <div className="p-4 text-center text-gray-600">
                  Nenhum contrato encontrado
                </div>
              ) : (
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
                        <td className="px-3 py-2 text-sm text-gray-900">{contract.contract_number}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{contract.contract_name}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{contract.contract_type}</td>
                        <td className="px-3 py-2 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${CONTRACT_STATUS[contract.status].color}-100 text-${CONTRACT_STATUS[contract.status].color}-800`}>
                            {CONTRACT_STATUS[contract.status].label}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">{contract.effective_date}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{contract.expiration_date}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingContract(contract);
                                setIsAddingContract(false);
                              }}
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
              )}
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
          </>
        )}
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