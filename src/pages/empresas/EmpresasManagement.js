import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { 
  Plus, 
  X, 
  Filter, 
  ChevronUp, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Type,
  Pen,
  Trash,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const baseStyles = {
  input: "w-full px-3 py-2 text-base border rounded focus:ring-1 focus:outline-none transition-shadow",
  label: "block text-base font-medium text-gray-600 mb-1",
  headerButton: "px-3 py-1.5 text-base rounded-md flex items-center gap-1.5 transition-all",
  tableHeader: "px-3 py-2 text-base font-medium text-gray-600 border-b border-gray-100",
  tableCell: "px-3 py-2 text-base text-gray-800 border-b border-gray-100",
  filterLabel: "block text-base font-medium text-gray-600 mb-1",
  iconButton: "p-1 rounded-md hover:bg-gray-50 transition-colors"
};

const EmpresasManagement = ({ buttonColor, isSidebarCollapsed }) => {
  const navigate = useNavigate();
  // Estados
  const [empresas, setEmpresas] = useState([]);
  const [formData, setFormData] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    status: 'ativo'
  });
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({
    razaoSocial: '',
    cnpj: '',
    email: '',
    status: ''
  });
  const [aviso, setAviso] = useState('');

  // Carregar empresas ao montar o componente
  useEffect(() => {
    carregarEmpresas();
  }, []);

  // Função para obter configuração do axios com token
  const getAxiosConfig = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  // Função para carregar a lista de empresas
  const carregarEmpresas = async () => {
    setLoading(true);
    try {
      const config = getAxiosConfig();
      if (!config) return;

      const response = await axios.get(`${API_URL}/empresas`, config);
      setEmpresas(response.data);
      setErro('');
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setErro('Erro ao carregar empresas');
        console.error('Erro ao carregar empresas:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar CEP
  const buscarCEP = async (cep) => {
    if (cep.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: response.data.logradouro,
            bairro: response.data.bairro,
            cidade: response.data.localidade,
            estado: response.data.uf
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  // Adicionar função para limpar campos
  const limparCampos = (dados) => {
    return {
      ...dados,
      cnpj: dados.cnpj.replace(/\D/g, ''),  // Remove tudo que não é número
      cep: dados.cep ? dados.cep.replace(/\D/g, '') : '',
      telefone: dados.telefone ? dados.telefone.replace(/\D/g, '') : '',
      inscricaoEstadual: dados.inscricaoEstadual ? dados.inscricaoEstadual.replace(/\D/g, '') : ''
    };
  };

  // Função para lidar com mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar formatação conforme o campo
    switch (name) {
      case 'cnpj':
        formattedValue = formatarCNPJ(value);
        break;
      case 'cep':
        formattedValue = formatarCEP(value);
        break;
      case 'telefone':
        formattedValue = formatarTelefone(value);
        break;
      default:
        formattedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Se o campo for CEP, buscar endereço
    if (name === 'cep') {
      const cepLimpo = value.replace(/\D/g, '');
      if (cepLimpo.length === 8) {
        buscarCEP(cepLimpo);
      }
    }
  };

  // Função para validar CNPJ
  const validarCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Implementar validação completa do CNPJ se necessário
    return true;
  };

  // Função para validar formulário
  const validarFormulario = () => {
    if (!formData.razaoSocial.trim()) {
      setErro('A Razão Social é obrigatória');
      return false;
    }

    if (!formData.cnpj.trim()) {
      setErro('O CNPJ é obrigatório');
      return false;
    }

    const cnpjLimpo = formData.cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) {
      setErro('CNPJ inválido. Deve conter 14 dígitos');
      return false;
    }

    if (!formData.email.trim()) {
      setErro('O Email é obrigatório');
      return false;
    }

    if (!formData.email.includes('@')) {
      setErro('Email inválido');
      return false;
    }

    if (formData.cep) {
      const cepLimpo = formData.cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) {
        setErro('CEP inválido. Deve conter 8 dígitos');
        return false;
      }
    }

    if (formData.estado && formData.estado.length !== 2) {
      setErro('Estado inválido. Use a sigla do estado (ex: SP)');
      return false;
    }

    return true;
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setLoading(true);
    setErro('');
    setAviso('');
    try {
      const config = getAxiosConfig();
      if (!config) return;

      // Verificar se CNPJ já existe antes de enviar
      const cnpjLimpo = formData.cnpj.replace(/\D/g, '');
      const empresaExistente = empresas.find(e => e.cnpj.replace(/\D/g, '') === cnpjLimpo);
      if (empresaExistente && (!editando || editando !== empresaExistente.id)) {
        setAviso(`Atenção: CNPJ ${formData.cnpj} já está cadastrado para a empresa ${empresaExistente.razaoSocial}`);
        setLoading(false);
        return;
      }

      // Limpar campos antes de enviar
      const dadosLimpos = limparCampos(formData);

      if (editando) {
        await axios.put(`${API_URL}/empresas/${editando}`, dadosLimpos, config);
        setMensagem('Empresa atualizada com sucesso!');
      } else {
        await axios.post(`${API_URL}/empresas`, dadosLimpos, config);
        setMensagem('Empresa cadastrada com sucesso!');
      }
      
      // Limpar formulário e recarregar lista
      setFormData({
        razaoSocial: '',
        nomeFantasia: '',
        cnpj: '',
        inscricaoEstadual: '',
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: '',
        email: '',
        status: 'ativo'
      });
      setEditando(null);
      setShowForm(false);
      carregarEmpresas();
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setErro(error.response?.data?.detail || 'Erro ao salvar empresa');
        console.error('Erro ao salvar empresa:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para editar empresa
  const handleEdit = (empresa) => {
    setFormData(empresa);
    setEditando(empresa.id);
    setErro('');
    setMensagem('');
    setShowForm(true);
  };

  // Função para excluir empresa
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      setLoading(true);
      try {
        const config = getAxiosConfig();
        if (!config) return;

        await axios.delete(`${API_URL}/empresas/${id}`, config);
        setMensagem('Empresa excluída com sucesso!');
        carregarEmpresas();
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setErro('Erro ao excluir empresa');
          console.error('Erro ao excluir empresa:', error);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Classes condicionais baseadas no estado do sidebar
  const mainClassName = `p-6 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`;

  // Calcular índices para paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredEmpresas = empresas.filter(empresa => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      
      if (key === 'status') {
        return empresa[key] === filters[key];
      }
      
      return empresa[key]?.toLowerCase().includes(filters[key].toLowerCase());
    });
  });
  const currentEmpresas = filteredEmpresas.slice(indexOfFirstItem, indexOfLastItem);

  // Adicionar função para lidar com mudanças nos filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Adicionar função para formatar CNPJ na exibição
  const formatarCNPJ = (cnpj) => {
    if (!cnpj) return '';
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  // Adicionar função para formatar CEP
  const formatarCEP = (cep) => {
    if (!cep) return '';
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  };

  // Adicionar função para formatar telefone
  const formatarTelefone = (telefone) => {
    if (!telefone) return '';
    const tel = telefone.replace(/\D/g, '');
    if (tel.length === 11) {
      return tel.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
    return tel.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  };

  return (
    <div className={mainClassName}>
      {/* Header com título e botões */}
      <div className="flex justify-between items-center h-14 bg-white border-b px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium">Gestão de Empresas</h1>
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
            onClick={() => setShowForm(true)}
            style={{ backgroundColor: buttonColor }}
            className={`${baseStyles.headerButton} text-white`}
          >
            <Plus size={16} />
            Nova Empresa
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
      <div className="flex-1 p-4 overflow-auto">
        {/* Área de Filtros - Movida para cima */}
        {isFilterExpanded && (
          <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={baseStyles.filterLabel}>Razão Social</label>
                <input
                  type="text"
                  name="razaoSocial"
                  value={filters.razaoSocial}
                  onChange={handleFilterChange}
                  className={baseStyles.input}
                  placeholder="Filtrar por razão social"
                />
              </div>
              <div>
                <label className={baseStyles.filterLabel}>CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  value={filters.cnpj}
                  onChange={handleFilterChange}
                  className={baseStyles.input}
                  placeholder="Filtrar por CNPJ"
                />
              </div>
              <div>
                <label className={baseStyles.filterLabel}>Email</label>
                <input
                  type="text"
                  name="email"
                  value={filters.email}
                  onChange={handleFilterChange}
                  className={baseStyles.input}
                  placeholder="Filtrar por email"
                />
              </div>
              <div>
                <label className={baseStyles.filterLabel}>Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className={baseStyles.input}
                >
                  <option value="">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
            {/* Header do Formulário */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-medium text-gray-900">
                {editando ? 'Editar Empresa' : 'Nova Empresa'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditando(null);
                  setFormData({
                    razaoSocial: '',
                    nomeFantasia: '',
                    cnpj: '',
                    inscricaoEstadual: '',
                    endereco: '',
                    numero: '',
                    complemento: '',
                    bairro: '',
                    cidade: '',
                    estado: '',
                    cep: '',
                    telefone: '',
                    email: '',
                    status: 'ativo'
                  });
                }}
                className={baseStyles.iconButton}
              >
                <X size={20} className="stroke-[1.5]" />
              </button>
            </div>

            {/* Formulário com scroll */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={baseStyles.label}>Razão Social *</label>
                    <input
                      type="text"
                      name="razaoSocial"
                      value={formData.razaoSocial}
                      onChange={handleChange}
                      className={baseStyles.input}
                      required
                    />
                  </div>

                  <div>
                    <label className={baseStyles.label}>Nome Fantasia</label>
                    <input
                      type="text"
                      name="nomeFantasia"
                      value={formData.nomeFantasia}
                      onChange={handleChange}
                      className={baseStyles.input}
                    />
                  </div>

                  <div>
                    <label className={baseStyles.label}>CNPJ *</label>
                    <input
                      type="text"
                      name="cnpj"
                      value={formatarCNPJ(formData.cnpj)}
                      onChange={handleChange}
                      className={baseStyles.input}
                      required
                    />
                  </div>

                  <div>
                    <label className={baseStyles.label}>Inscrição Estadual</label>
                    <input
                      type="text"
                      name="inscricaoEstadual"
                      value={formData.inscricaoEstadual}
                      onChange={handleChange}
                      className={baseStyles.input}
                    />
                  </div>

                  <div>
                    <label className={baseStyles.label}>CEP</label>
                    <input
                      type="text"
                      name="cep"
                      value={formatarCEP(formData.cep)}
                      onChange={handleChange}
                      className={baseStyles.input}
                    />
                  </div>

                  <div>
                    <label className={baseStyles.label}>Endereço</label>
                    <input
                      type="text"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleChange}
                      className={baseStyles.input}
                    />
                  </div>

                  <div>
                    <label className={baseStyles.label}>Número</label>
                    <input
                      type="text"
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      className={baseStyles.input}
                    />
                  </div>

                  <div>
                    <label className={baseStyles.label}>Complemento</label>
                    <input
                      type="text"
                      name="complemento"
                      value={formData.complemento}
                      onChange={handleChange}
                      className={baseStyles.input}
                    />
                  </div>

                  <div>
                    <label className={baseStyles.label}>Bairro</label>
                    <input
                      type="text"
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleChange}
                      className={baseStyles.input}
                    />
                  </div>

                  <div>
                    <label className={baseStyles.label}>Cidade</label>
                    <input
                      type="text"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      className={baseStyles.input}
                    />
                  </div>

                  <div>
                    <label className={baseStyles.label}>Estado</label>
                    <input
                      type="text"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className={baseStyles.input}
                    />
                  </div>

                  <div>
                    <label className={baseStyles.label}>Telefone</label>
                    <input
                      type="tel"
                      name="telefone"
                      value={formatarTelefone(formData.telefone)}
                      onChange={handleChange}
                      className={baseStyles.input}
                    />
                  </div>

                  <div>
                    <label className={baseStyles.label}>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={baseStyles.input}
                      required
                    />
                  </div>

                  <div>
                    <label className={baseStyles.label}>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={baseStyles.input}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditando(null);
                      setFormData({
                        razaoSocial: '',
                        nomeFantasia: '',
                        cnpj: '',
                        inscricaoEstadual: '',
                        endereco: '',
                        numero: '',
                        complemento: '',
                        bairro: '',
                        cidade: '',
                        estado: '',
                        cep: '',
                        telefone: '',
                        email: '',
                        status: 'ativo'
                      });
                      setErro('');
                      setMensagem('');
                    }}
                    className={baseStyles.iconButton}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{ backgroundColor: buttonColor }}
                    className={`${baseStyles.headerButton} text-white`}
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : editando ? 'Atualizar' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </div>

            {(erro || aviso || mensagem) && (
              <div className={`p-4 mb-4 rounded-lg ${
                erro ? 'bg-red-50 text-red-700' : 
                aviso ? 'bg-yellow-50 text-yellow-700' : 
                'bg-green-50 text-green-700'
              }`}>
                <div className="flex items-center gap-2">
                  {erro && <X className="w-5 h-5" />}
                  {aviso && <HelpCircle className="w-5 h-5" />}
                  {mensagem && <CheckCircle className="w-5 h-5" />}
                  <span className="text-sm font-medium">
                    {erro || aviso || mensagem}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabela */}
        {!showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className={baseStyles.tableHeader}>Razão Social</th>
                  <th className={baseStyles.tableHeader}>CNPJ</th>
                  <th className={baseStyles.tableHeader}>Telefone</th>
                  <th className={baseStyles.tableHeader}>Email</th>
                  <th className={baseStyles.tableHeader}>Status</th>
                  <th className={baseStyles.tableHeader}>Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentEmpresas.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-gray-50">
                    <td className={baseStyles.tableCell}>{empresa.razaoSocial}</td>
                    <td className={baseStyles.tableCell}>{formatarCNPJ(empresa.cnpj)}</td>
                    <td className={baseStyles.tableCell}>{formatarTelefone(empresa.telefone)}</td>
                    <td className={baseStyles.tableCell}>{empresa.email}</td>
                    <td className={baseStyles.tableCell}>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        empresa.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {empresa.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className={baseStyles.tableCell}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(empresa)}
                          className={baseStyles.iconButton}
                          title="Editar"
                        >
                          <Pen size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(empresa.id)}
                          className={baseStyles.iconButton}
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

            {/* Paginação */}
            <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {`${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredEmpresas.length)} de ${filteredEmpresas.length}`}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`${baseStyles.iconButton} disabled:opacity-30`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-gray-600 min-w-[3rem] text-center">
                    {currentPage} / {Math.ceil(filteredEmpresas.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredEmpresas.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredEmpresas.length / itemsPerPage)}
                    className={`${baseStyles.iconButton} disabled:opacity-30`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Ajuda */}
        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
              {/* Header do Modal */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <HelpCircle size={24} className="text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900">Ajuda - Gestão de Empresas</h2>
                </div>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} className="stroke-[1.5]" />
                </button>
              </div>
              
              {/* ... conteúdo do modal de ajuda ... */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpresasManagement; 