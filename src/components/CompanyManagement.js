import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus,
  Filter,
  ChevronUp,
  ChevronDown,
  Pen,
  Trash,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import { API_URL } from '../config';
import helpData from '../data/help.json';

// No início do arquivo, adicione o texto de ajuda
const helpText = (
  <div className="space-y-4">
    <div>
      <h1 className="text-sm font-medium text-gray-800 mb-2">Gestão de Empresas</h1>
      <p className="text-xs text-gray-600">
        Este módulo permite gerenciar o cadastro de empresas no sistema. Aqui você pode adicionar, 
        editar, excluir e filtrar empresas de forma eficiente.
      </p>
    </div>

    <div>
      <h2 className="text-sm font-medium text-gray-800 mb-2">Campos do Formulário</h2>
      
      <div className="mb-3">
        <h3 className="text-xs font-medium text-gray-700 mb-2">Campos Obrigatórios</h3>
        <div className="space-y-2">
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-xs font-medium text-gray-700">CNPJ</span>
            <ul className="mt-1 space-y-1">
              <li className="text-xs text-gray-600">• Número de identificação da empresa (14 dígitos)</li>
              <li className="text-xs text-gray-600">• Apenas números são aceitos</li>
              <li className="text-xs text-gray-600">• Deve conter exatamente 14 dígitos</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-xs font-medium text-gray-700">Nome</span>
            <ul className="mt-1 space-y-1">
              <li className="text-xs text-gray-600">• Nome comercial da empresa</li>
              <li className="text-xs text-gray-600">• Texto livre, máximo 100 caracteres</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium text-gray-700 mb-2">Campos Opcionais</h3>
        <div className="space-y-2">
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-xs font-medium text-gray-700">Dados Básicos</span>
            <ul className="mt-1 space-y-1">
              <li className="text-xs text-gray-600">• Razão Social: nome oficial registrado na Receita Federal</li>
              <li className="text-xs text-gray-600">• Nome Fantasia: nome comercial/marketing da empresa</li>
              <li className="text-xs text-gray-600">• Porte: Micro, Pequena, Média ou Grande</li>
              <li className="text-xs text-gray-600">• Setor: área de atuação da empresa</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-xs font-medium text-gray-700">Localização e Contato</span>
            <ul className="mt-1 space-y-1">
              <li className="text-xs text-gray-600">• Cidade e Estado (UF) da sede</li>
              <li className="text-xs text-gray-600">• Telefone: apenas números e caracteres especiais</li>
              <li className="text-xs text-gray-600">• Email: deve ser um email válido</li>
              <li className="text-xs text-gray-600">• Website: deve ser uma URL válida</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h2 className="text-sm font-medium text-gray-800 mb-2">Funcionalidades</h2>
      <div className="bg-gray-50 p-2 rounded">
        <ul className="space-y-1">
          <li className="text-xs text-gray-600">• Filtros: permite filtrar empresas por qualquer campo</li>
          <li className="text-xs text-gray-600">• Ordenação: clique nos cabeçalhos das colunas para ordenar</li>
          <li className="text-xs text-gray-600">• Edição: use o botão de lápis para editar registros</li>
          <li className="text-xs text-gray-600">• Exclusão: use o botão de lixeira para remover registros</li>
          <li className="text-xs text-gray-600">• Paginação: navegue entre as páginas de resultados</li>
        </ul>
      </div>
    </div>
  </div>
);

// Atualizando os estilos base
const baseStyles = {
  input: "w-full px-2.5 py-1.5 text-xs border rounded focus:ring-1 focus:outline-none transition-shadow",
  label: "block text-xs font-medium text-gray-600 mb-1",
  headerButton: "px-3 py-1.5 text-xs rounded-md flex items-center gap-1.5 transition-all",
  tableHeader: "px-3 py-2 text-xs font-medium text-gray-600 border-b border-gray-100",
  tableCell: "px-3 py-2 text-xs text-gray-800 border-b border-gray-100",
  iconButton: "p-1 rounded-md hover:bg-gray-50 transition-colors",
};

// Definir as colunas da tabela
const tableColumns = [
  { key: 'cnpj', label: 'CNPJ', sortable: true },
  { key: 'name', label: 'Nome', sortable: true },
  { key: 'razao_social', label: 'Razão Social', sortable: true, responsive: 'lg' },
  { key: 'size', label: 'Porte', sortable: true, responsive: 'md' },
  { key: 'sector', label: 'Setor', sortable: true, responsive: 'lg' },
  { key: 'city', label: 'Cidade', sortable: true, responsive: 'md' },
  { key: 'state', label: 'UF', sortable: true },
  { key: 'is_active', label: 'Status', sortable: true },
  { key: 'actions', label: 'Ações', sortable: false }
];

function CompanyManagement({ buttonColor, isSidebarCollapsed }) {
  // Adicionar debug
  console.log('isSidebarCollapsed:', isSidebarCollapsed);

  const [companies, setCompanies] = useState([]);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({
    cnpj: '',
    name: '',
    razao_social: '',
    endereco: '',
    trade_name: '',
    registration_date: '',
    size: '',
    sector: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    website: '',
    is_active: true
  });
  const [editingCompany, setEditingCompany] = useState(null);
  const [filters, setFilters] = useState({
    cnpj: '',
    name: '',
    razao_social: '',
    trade_name: '',
    size: '',
    sector: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    registration_date: '',
    is_active: ''
  });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none' // 'none', 'asc' ou 'desc'
  });
  const [showHelp, setShowHelp] = useState(false);
  const [focusedRow, setFocusedRow] = useState(null);

  // Adicionar opções de tamanho
  const sizeOptions = ['Micro', 'Pequena', 'Média', 'Grande'];

  // Adicionar opçes de setores
  const sectorOptions = [
    'Tecnologia da Informação (TI)',
    'Saúde',
    'Bens de Capital',
    'Consumo Cíclico',
    'Consumo Não-Cíclico',
    'Energia',
    'Financeiro',
    'Materiais Básicos',
    'Imobiliário',
    'Serviços',
    'Utilidades Públicas',
    'Telecomunicações',
    'Transporte e Logística',
    'Setor Público'
  ];

  // Adicionar estados para mensagens de erro
  const [errors, setErrors] = useState({
    email: '',
    website: ''
  });

  // Função para validar email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para validar website
  const validateWebsite = (website) => {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return urlRegex.test(website);
  };

  // Função para lidar com mudança no email
  const handleEmailChange = (e, isEditing) => {
    const email = e.target.value;
    if (email && !validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Email inválido' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }

    if (isEditing) {
      setEditingCompany({ ...editingCompany, email });
    } else {
      setNewCompany({ ...newCompany, email });
    }
  };

  // Função para lidar com mudança no website
  const handleWebsiteChange = (e, isEditing) => {
    const website = e.target.value;
    if (website && !validateWebsite(website)) {
      setErrors(prev => ({ ...prev, website: 'Website inválido' }));
    } else {
      setErrors(prev => ({ ...prev, website: '' }));
    }

    if (isEditing) {
      setEditingCompany({ ...editingCompany, website });
    } else {
      setNewCompany({ ...newCompany, website });
    }
  };

  // Função para lidar com mudanças nos campos do formulário
  const handleNewCompanyChange = (e) => {
    const { name, value } = e.target;
    setNewCompany(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/companies`);
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  };

  // Função para adicionar nova empresa
  const handleAddCompany = async () => {
    try {
    // Validar campos obrigatórios
    if (!newCompany.cnpj || !newCompany.name) {
        alert('CNPJ e Nome são campos obrigatórios');
        return;
    }

      // Formatar CNPJ (remover pontos, traços e barras)
      const cnpjFormatted = newCompany.cnpj
        .replace(/[^\d]/g, '')  // Remove tudo que não é dígito
        .padStart(14, '0');     // Garante 14 dígitos

      if (cnpjFormatted.length !== 14) {
        alert('CNPJ deve conter 14 dígitos');
        return;
    }

        // Formatar os dados antes de enviar
        const formattedCompany = {
        cnpj: cnpjFormatted,
            name: newCompany.name.trim(),
        razao_social: newCompany.razao_social || null,
        trade_name: newCompany.trade_name || null,
        size: newCompany.size || null,
        sector: newCompany.sector || null,
        city: newCompany.city || null,
        state: newCompany.state || null,
        phone: newCompany.phone || null,
        email: newCompany.email || null,
        website: newCompany.website || null,
        is_active: true,
        registration_date: new Date().toISOString().split('T')[0],
        endereco: null,
        zip_code: null
      };

      const response = await axios.post(`${API_URL}/companies`, formattedCompany);
      setCompanies(prev => [...prev, response.data]);
        setNewCompany({ 
            cnpj: '', 
            name: '', 
            razao_social: '', 
            trade_name: '', 
            size: '', 
            sector: '', 
            city: '', 
            state: '', 
            phone: '', 
            email: '', 
            website: '', 
            is_active: true 
        });
        setIsAddingCompany(false);
    } catch (error) {
      console.error('Erro detalhado:', error.response?.data);
      alert(error.response?.data?.detail || 'Erro ao adicionar empresa');
    }
  };

  const handleUpdateCompany = async () => {
    try {
      const response = await axios.put(`${API_URL}/companies/${editingCompany.id}`, {
        cnpj: editingCompany.cnpj,
        name: editingCompany.name,
        razao_social: editingCompany.razao_social,
        endereco: editingCompany.endereco,
        trade_name: editingCompany.trade_name,
        registration_date: editingCompany.registration_date,
        size: editingCompany.size,
        sector: editingCompany.sector,
        city: editingCompany.city,
        state: editingCompany.state,
        zip_code: editingCompany.zip_code,
        phone: editingCompany.phone,
        email: editingCompany.email,
        website: editingCompany.website,
        is_active: editingCompany.is_active
      });
      setCompanies(companies.map(company => company.id === editingCompany.id ? response.data : company));
      setEditingCompany(null);
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      alert(error.response?.data?.detail || 'Erro ao atualizar empresa');
    }
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await axios.delete(`${API_URL}/companies/${id}`);
        setCompanies(companies.filter((company) => company.id !== id));
      } catch (error) {
        console.error('Erro ao deletar empresa:', error);
        alert(error.response?.data?.detail || 'Erro ao deletar empresa');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const renderColumnFilter = (columnName, placeholder) => (
    <div className="flex items-center">
      <input
        type="text"
        name={columnName}
        value={filters[columnName]}
        onChange={handleFilterChange}
        className="w-full p-1 text-sm border rounded"
        placeholder={`Filtrar ${placeholder}`}
      />
      <Filter size={16} className="ml-1 text-gray-500" />
    </div>
  );

  const filteredCompanies = companies.filter(company => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      if (key === 'is_active') {
        const filterValue = filters[key].toLowerCase();
        const isActive = company[key] ? 'sim' : 'não';
        return isActive.includes(filterValue);
      }
      return company[key]?.toString().toLowerCase().includes(filters[key].toLowerCase());
    });
  });

  useEffect(() => {
    setTotalPages(Math.ceil(filteredCompanies.length / itemsPerPage));
  }, [filteredCompanies, itemsPerPage]);

  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Função para ordenar os dados
  const sortData = (data, key, direction) => {
    if (direction === 'none') return data;
    
    return [...data].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      
      const aValue = typeof a[key] === 'string' ? a[key].toLowerCase() : a[key];
      const bValue = typeof b[key] === 'string' ? b[key].toLowerCase() : b[key];
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Função para lidar com o clique no cabeçalho da coluna
  const handleSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = 'none';
      else direction = 'asc';
    }
    
    setSortConfig({ key, direction });
  };

  // Função para renderizar o ícone de ordenação
  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={14} className="stroke-[1.5] opacity-50" />;
    }
    
    if (sortConfig.direction === 'asc') {
      return <ArrowUp size={14} className="stroke-[1.5]" />;
    }
    
    if (sortConfig.direction === 'desc') {
      return <ArrowDown size={14} className="stroke-[1.5]" />;
    }
    
    return <ArrowUpDown size={14} className="stroke-[1.5] opacity-50" />;
  };

  // Adicionar handler para teclas
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!focusedRow && e.key === 'ArrowDown') {
        // Se nenhuma linha estiver focada, focar a primeira
        setFocusedRow(0);
        return;
      }

      switch(e.key) {
        case 'ArrowDown':
          setFocusedRow(prev => 
            prev < getCurrentPageItems().length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          setFocusedRow(prev => prev > 0 ? prev - 1 : prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedRow]);

  return (
    <div 
      className={`
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
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center h-14 bg-white border-b px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium text-gray-800">Gestão de Empresas</h1>
            <HelpCircle
            size={16} 
            className="text-gray-400 cursor-help"
            onClick={() => setShowHelp(true)}
          />
        </div>

          <button
            onClick={() => setIsAddingCompany(!isAddingCompany)}
          className={`${baseStyles.headerButton} text-white`}
            style={{ backgroundColor: buttonColor }}
          >
          <Plus size={14} className="stroke-[1.5]" />
          {isAddingCompany ? 'Cancelar' : 'Nova Empresa'}
          </button>
      </div>

      {/* Área de conteúdo com scroll */}
      <div className="flex-1 overflow-auto p-4">
        {/* Formulário de Nova Empresa */}
        {isAddingCompany && (
          <div className="bg-white rounded border border-gray-100 mb-4 p-4">
            <h2 className="text-sm font-medium text-gray-800 mb-4">Nova Empresa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* CNPJ */}
              <div>
                <label className={baseStyles.label}>CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  value={newCompany.cnpj}
                  onChange={handleNewCompanyChange}
                  className={baseStyles.input}
                />
              </div>
              
              {/* Nome */}
              <div>
                <label className={baseStyles.label}>Nome</label>
                <input
                  type="text"
                  name="name"
                  value={newCompany.name}
                  onChange={handleNewCompanyChange}
                  className={baseStyles.input}
                />
              </div>
              
              {/* Razão Social */}
              <div>
                <label className={baseStyles.label}>Razão Social</label>
                <input
                  type="text"
                  name="razao_social"
                  value={newCompany.razao_social}
                  onChange={handleNewCompanyChange}
                  className={baseStyles.input}
                />
              </div>
              
              {/* Nome Fantasia */}
              <div>
                <label className={baseStyles.label}>Nome Fantasia</label>
                <input
                  type="text"
                  name="trade_name"
                  value={newCompany.trade_name}
                  onChange={handleNewCompanyChange}
                  className={baseStyles.input}
                />
              </div>
              
              {/* Porte */}
              <div>
                <label className={baseStyles.label}>Porte</label>
                <select
                  name="size"
                  value={newCompany.size}
                  onChange={handleNewCompanyChange}
                  className={baseStyles.input}
                >
                  <option value="">Selecione...</option>
                  {sizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              
              {/* Setor */}
              <div>
                <label className={baseStyles.label}>Setor</label>
                <select
                  name="sector"
                  value={newCompany.sector}
                  onChange={handleNewCompanyChange}
                  className={baseStyles.input}
                >
                  <option value="">Selecione...</option>
                  {sectorOptions.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
            </div>
            
              {/* Cidade */}
            <div>
                <label className={baseStyles.label}>Cidade</label>
                <input
                    type="text"
                  name="city"
                  value={newCompany.city}
                  onChange={handleNewCompanyChange}
                  className={baseStyles.input}
                />
            </div>

              {/* Estado */}
            <div>
                <label className={baseStyles.label}>Estado</label>
                <input
                    type="text"
                  name="state"
                  value={newCompany.state}
                  onChange={handleNewCompanyChange}
                  className={baseStyles.input}
                />
            </div>

              {/* Telefone */}
            <div>
                <label className={baseStyles.label}>Telefone</label>
                <input
                    type="text"
                  name="phone"
                  value={newCompany.phone}
                  onChange={handleNewCompanyChange}
                  className={baseStyles.input}
                />
            </div>

              {/* Email */}
            <div>
                <label className={baseStyles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newCompany.email}
                  onChange={handleNewCompanyChange}
                  className={baseStyles.input}
                />
            </div>

              {/* Website */}
            <div>
                <label className={baseStyles.label}>Website</label>
                <input
                  type="url"
                  name="website"
                  value={newCompany.website}
                  onChange={handleNewCompanyChange}
                  className={baseStyles.input}
                />
            </div>

              {/* Status */}
            <div>
                <label className={baseStyles.label}>Status</label>
                <select
                  name="is_active"
                  value={newCompany.is_active}
                  onChange={handleNewCompanyChange}
                  className={baseStyles.input}
                >
                  <option value={true}>Ativo</option>
                  <option value={false}>Inativo</option>
                </select>
            </div>

              {/* Botões */}
              <div className="col-span-full flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setIsAddingCompany(false)}
                  className="px-3 py-1.5 text-xs rounded-md border border-gray-200 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCompany}
                  className="px-3 py-1.5 text-xs rounded-md text-white"
                  style={{ backgroundColor: buttonColor }}
                >
                  Salvar
                </button>
            </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded border border-gray-100 mb-4 text-xs">
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50"
            style={{ color: buttonColor }}
          >
            <div className="flex items-center gap-1.5">
              <Filter size={14} className="stroke-[1.5]" />
              <span>Filtros</span>
            </div>
            {isFilterExpanded ? 
              <ChevronUp size={14} /> : 
              <ChevronDown size={14} />
            }
          </button>
          
          {isFilterExpanded && (
            <div className="p-4 border-t border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* CNPJ */}
            <div>
                  <label className={baseStyles.label}>CNPJ</label>
                <input
                    type="text"
                    name="cnpj"
                    value={filters.cnpj}
                    onChange={handleFilterChange}
                    className={baseStyles.input}
                    placeholder="Filtrar por CNPJ"
                />
            </div>

                {/* Nome */}
            <div>
                  <label className={baseStyles.label}>Nome</label>
                <input
                    type="text"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    className={baseStyles.input}
                    placeholder="Filtrar por Nome"
                />
            </div>

                {/* Razão Social */}
            <div>
                  <label className={baseStyles.label}>Razão Social</label>
                <input
                    type="text"
                    name="razao_social"
                    value={filters.razao_social}
                    onChange={handleFilterChange}
                    className={baseStyles.input}
                    placeholder="Filtrar por Razão Social"
                />
            </div>

                {/* Nome Fantasia */}
            <div>
                  <label className={baseStyles.label}>Nome Fantasia</label>
                <input
                    type="text"
                    name="trade_name"
                    value={filters.trade_name}
                    onChange={handleFilterChange}
                    className={baseStyles.input}
                    placeholder="Filtrar por Nome Fantasia"
                />
            </div>

                {/* Porte */}
            <div>
                  <label className={baseStyles.label}>Porte</label>
                  <select
                    name="size"
                    value={filters.size}
                    onChange={handleFilterChange}
                    className={baseStyles.input}
                  >
                    <option value="">Todos</option>
                    {sizeOptions.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
            </div>

                {/* Setor */}
            <div>
                  <label className={baseStyles.label}>Setor</label>
                  <select
                    name="sector"
                    value={filters.sector}
                    onChange={handleFilterChange}
                    className={baseStyles.input}
                  >
                    <option value="">Todos</option>
                    {sectorOptions.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                {/* Cidade */}
                <div>
                  <label className={baseStyles.label}>Cidade</label>
                <input
                    type="text"
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    className={baseStyles.input}
                    placeholder="Filtrar por Cidade"
                  />
            </div>

                {/* Estado */}
                <div>
                  <label className={baseStyles.label}>Estado</label>
                    <input
                    type="text"
                    name="state"
                    value={filters.state}
                    onChange={handleFilterChange}
                    className={baseStyles.input}
                    placeholder="Filtrar por Estado"
                  />
            </div>

                {/* Status */}
                <div>
                  <label className={baseStyles.label}>Status</label>
                  <select
                    name="is_active"
                    value={filters.is_active}
                    onChange={handleFilterChange}
                    className={baseStyles.input}
                  >
                    <option value="">Todos</option>
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
            </div>
          </div>
        </div>
      )}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
          <thead>
                <tr>
                  {tableColumns.map(column => (
                    <th 
                      key={column.key}
                      className={`
                        ${baseStyles.tableHeader} 
                        ${column.sortable ? 'cursor-pointer' : ''}
                        ${column.responsive === 'md' ? 'hidden md:table-cell' : ''}
                        ${column.responsive === 'lg' ? 'hidden lg:table-cell' : ''}
                      `}
                      onClick={() => column.sortable && handleSort(column.key)}
                      style={{ backgroundColor: `${buttonColor}50` }}
                    >
                      <div className="flex items-center gap-1">
                        <span>{column.label}</span>
                        {column.sortable && renderSortIcon(column.key)}
                </div>
              </th>
                  ))}
            </tr>
          </thead>
          <tbody>
                {sortData(getCurrentPageItems(), sortConfig.key, sortConfig.direction).map((company, index) => (
                  <tr 
                    key={company.id} 
                    style={{ 
                      backgroundColor: index % 2 === 0 ? `${buttonColor}30` : 'transparent',
                      '--hover-color': `${buttonColor}50`,
                      '--focus-color': `${buttonColor}70`
                    }}
                    className={`
                      transition-colors
                      cursor-pointer
                      hover:bg-[var(--hover-color)]
                      ${focusedRow === index ? 'bg-[var(--focus-color)] !important' : ''}
                      ${focusedRow === index ? 'outline outline-2 outline-offset-[-2px] outline-[var(--focus-color)]' : ''}
                    `}
                    onClick={() => setFocusedRow(index)}
                    tabIndex={0}
                    onFocus={() => setFocusedRow(index)}
                  >
                    <td className={baseStyles.tableCell}>{company.cnpj}</td>
                    <td className={baseStyles.tableCell}>{company.name}</td>
                    <td className={`${baseStyles.tableCell} hidden lg:table-cell`}>
                      {company.razao_social}
                </td>
                    <td className={`${baseStyles.tableCell} hidden md:table-cell`}>
                      {company.size}
                </td>
                    <td className={`${baseStyles.tableCell} hidden lg:table-cell`}>
                      {company.sector}
                </td>
                    <td className={`${baseStyles.tableCell} hidden md:table-cell`}>
                  {company.city}
                </td>
                    <td className={baseStyles.tableCell}>{company.state}</td>
                    <td className={baseStyles.tableCell}>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        company.is_active 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {company.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                </td>
                    <td className={baseStyles.tableCell}>
                      <div className="flex justify-center gap-1">
                    <button
                      onClick={() => setEditingCompany(company)}
                          className={baseStyles.iconButton}
                          style={{ color: buttonColor }}
                    >
                          <Pen size={14} className="stroke-[1.5]" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                          className={`${baseStyles.iconButton} text-red-500`}
                    >
                          <Trash size={14} className="stroke-[1.5]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {((currentPage - 1) * itemsPerPage) + 1}-
              {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} de {filteredCompanies.length}
            </span>
            
            <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
                className={`${baseStyles.iconButton} disabled:opacity-50`}
            >
                <ChevronLeft size={14} />
            </button>
              <span className="text-xs text-gray-600 px-2">
                {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
                className={`${baseStyles.iconButton} disabled:opacity-50`}
            >
                <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Modal de Ajuda */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Ajuda - Gestão de Empresas</h2>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="prose prose-sm">
              {helpText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyManagement;
