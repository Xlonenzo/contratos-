import React, { useState, useEffect, useRef } from 'react';
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

  // Estado do formulário atualizado conforme banco
  const [formData, setFormData] = useState({
    contract_number: '',
    contract_name: '',
    contract_type: '',
    contract_category: '',
    party_a_id: '',
    party_b_id: '',
    party_a_role: '',
    party_b_role: '',
    effective_date: '',
    expiration_date: '',
    renewal_terms: '',
    payment_terms: '',
    status: 'pending',
    escalation_clauses: '',
    document_url: ''
  });

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
  const [organizations, setOrganizations] = useState([]);

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

  // Buscar contratos com a nova estrutura
  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/contracts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setContracts(response.data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar contratos:', err);
      setError('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar organizações para o formulário
  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/organizations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrganizations(response.data);
    } catch (err) {
      console.error('Erro ao buscar organizações:', err);
    }
  };

  // Carregar organizações quando o modal abrir
  useEffect(() => {
    if (isAddingContract) {
      fetchOrganizations();
    }
  }, [isAddingContract]);

  // Função para criar novo contrato
  const handleCreateContract = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/contracts`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setIsAddingContract(false);
      fetchContracts(); // Recarregar lista
      setFormData({ // Resetar formulário
        contract_number: '',
        contract_name: '',
        contract_type: '',
        contract_category: '',
        party_a_id: '',
        party_b_id: '',
        party_a_role: '',
        party_b_role: '',
        effective_date: '',
        expiration_date: '',
        renewal_terms: '',
        payment_terms: '',
        status: 'pending',
        escalation_clauses: '',
        document_url: ''
      });
    } catch (err) {
      console.error('Erro ao criar contrato:', err);
      setError('Erro ao criar contrato');
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

  // Função para lidar com a seleção de texto
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(text);
      setTooltipPosition({
        x: rect.left,
        y: rect.bottom,
        start: range.startOffset,
        end: range.endOffset
      });
    } else {
      setTooltipPosition(null);
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

  // Função atualizada para criar issue
  const handleCreateIssue = async (issueData) => {
    try {
      const token = localStorage.getItem('token');
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

  // Handler para clique em issues existentes
  const handleIssueClick = (issueId, position) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      setTooltipPosition({
        ...position,
        issueId
      });
    }
  };

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
        {(editingContract !== null || isAddingContract) ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Navegação */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActivePage('data')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activePage === 'data' 
                    ? `border-current text-current` 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={activePage === 'data' ? { color: buttonColor } : {}}
              >
                <FileText size={16} />
                Dados do Contrato
              </button>
              <button
                onClick={() => setActivePage('document')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activePage === 'document' 
                    ? `border-current text-current` 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={activePage === 'document' ? { color: buttonColor } : {}}
              >
                <MessageSquare size={16} />
                Documento e Anotações
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              {activePage === 'data' ? (
                <form onSubmit={handleCreateContract} className="space-y-6">
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

                    {/* Partes Envolvidas */}
                    <div>
                      <label className={baseStyles.label}>Parte A</label>
                      <select
                        required
                        className={baseStyles.input}
                        value={formData.party_a_id}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          party_a_id: e.target.value
                        }))}
                      >
                        <option value="">Selecione...</option>
                        {organizations.map(org => (
                          <option key={org.org_id} value={org.org_id}>
                            {org.org_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={baseStyles.label}>Parte B</label>
                      <select
                        required
                        className={baseStyles.input}
                        value={formData.party_b_id}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          party_b_id: e.target.value
                        }))}
                      >
                        <option value="">Selecione...</option>
                        {organizations.map(org => (
                          <option key={org.org_id} value={org.org_id}>
                            {org.org_name}
                          </option>
                        ))}
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
                      type="submit"
                      style={{ backgroundColor: buttonColor }}
                      className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90"
                    >
                      {isAddingContract ? 'Criar Contrato' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex gap-4">
                  {/* Editor de Texto */}
                  <div className="flex-1 relative">
                    <CustomQuill 
                      value={contractText}
                      onChange={setContractText}
                      onChangeSelection={handleTextSelection}
                      onIssueClick={handleIssueClick}
                      ref={quillRef}
                    />
                    
                    {tooltipPosition && (
                      <IssueTooltip
                        position={tooltipPosition}
                        selectedText={selectedText}
                        onSubmit={handleCreateIssue}
                        onClose={() => setTooltipPosition(null)}
                        buttonColor={buttonColor}
                        existingIssue={tooltipPosition.issueId ? issues.find(i => i.id === tooltipPosition.issueId) : null}
                      />
                    )}
                  </div>

                  {/* Barra Lateral de Funcionalidades */}
                  <div className="w-64 border-l border-gray-200 pl-4 space-y-4">
                    {/* Comentários */}
                    <div>
                      <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <MessageCircle size={16} />
                        Comentários
                      </h3>
                      <div className="space-y-2">
                        {comments.map(comment => (
                          <div key={comment.id} className="text-sm bg-gray-50 p-2 rounded">
                            <div className="font-medium">{comment.user}</div>
                            <div>{comment.text}</div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowCommentForm(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                      >
                        Adicionar comentário
                      </button>
                    </div>

                    {/* Análise IA */}
                    <div>
                      <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Bot size={16} />
                        Análise IA
                      </h3>
                      <button
                        onClick={handleAIAnalysis}
                        className="text-sm bg-purple-50 text-purple-700 px-3 py-1.5 rounded hover:bg-purple-100"
                      >
                        Analisar Contrato
                      </button>
                    </div>

                    {/* Issues */}
                    <div>
                      <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} />
                        Issues
                      </h3>
                      <div className="space-y-2">
                        {issues.map(issue => (
                          <div key={issue.id} className="text-sm bg-gray-50 p-2 rounded">
                            <div className="font-medium">{issue.title}</div>
                            <div className="text-gray-600">{issue.status}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Histórico */}
                    <div>
                      <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <History size={16} />
                        Histórico
                      </h3>
                      <div className="space-y-2">
                        {history.map(entry => (
                          <div key={entry.id} className="text-sm text-gray-600">
                            {entry.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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