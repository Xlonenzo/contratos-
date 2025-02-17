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

const IndividualsManagement = ({ buttonColor, isSidebarCollapsed }) => {
  const navigate = useNavigate();
  const [individuals, setIndividuals] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    orgao_emissor: '',
    data_emissao: '',
    data_nascimento: '',
    sexo: '',
    estado_civil: '',
    nacionalidade: '',
    naturalidade: '',
    profissao: '',
    nome_pai: '',
    nome_mae: '',
    titulo_eleitor: '',
    zona_eleitoral: '',
    secao_eleitoral: '',
    carteira_trabalho: '',
    serie_ctps: '',
    pis_pasep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    celular: '',
    email: '',
    banco: '',
    agencia: '',
    conta: '',
    tipo_conta: '',
    status: 'ativo',
    observacoes: ''
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
    nome: '',
    cpf: '',
    email: '',
    status: ''
  });

  useEffect(() => {
    carregarIndividuos();
  }, []);

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

  const carregarIndividuos = async () => {
    setLoading(true);
    try {
      const config = getAxiosConfig();
      if (!config) return;

      const response = await axios.get(`${API_URL}/individuos`, config);
      setIndividuals(response.data);
      setErro('');
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setErro('Erro ao carregar indivíduos');
        console.error('Erro ao carregar indivíduos:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Funções de formatação
  const formatarCPF = (cpf) => {
    if (!cpf) return '';
    const cpfLimpo = cpf.replace(/\D/g, '');
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return '';
    const tel = telefone.replace(/\D/g, '');
    if (tel.length === 11) {
      return tel.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
    return tel.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  };

  const formatarCEP = (cep) => {
    if (!cep) return '';
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  };

  // Função para validar CPF
  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    return true;
  };

  // Função para validar formulário
  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      setErro('O Nome é obrigatório');
      return false;
    }

    if (!formData.cpf.trim()) {
      setErro('O CPF é obrigatório');
      return false;
    }

    const cpfLimpo = formData.cpf.replace(/\D/g, '');
    if (!validarCPF(cpfLimpo)) {
      setErro('CPF inválido');
      return false;
    }

    if (!formData.email.trim()) {
      setErro('O Email é obrigatório');
      return false;
    }

    if (!formData.data_nascimento) {
      setErro('A Data de Nascimento é obrigatória');
      return false;
    }

    return true;
  };

  // Handler para mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    switch (name) {
      case 'cpf':
        formattedValue = formatarCPF(value);
        break;
      case 'telefone':
      case 'celular':
        formattedValue = formatarTelefone(value);
        break;
      case 'cep':
        formattedValue = formatarCEP(value);
        break;
      default:
        formattedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // Handler para submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setLoading(true);
    setErro('');
    try {
      const config = getAxiosConfig();
      if (!config) return;

      const dadosLimpos = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone?.replace(/\D/g, ''),
        celular: formData.celular?.replace(/\D/g, ''),
        cep: formData.cep?.replace(/\D/g, '')
      };

      if (editando) {
        await axios.put(`${API_URL}/individuos/${editando}`, dadosLimpos, config);
        setMensagem('Indivíduo atualizado com sucesso!');
      } else {
        await axios.post(`${API_URL}/individuos`, dadosLimpos, config);
        setMensagem('Indivíduo cadastrado com sucesso!');
      }

      setShowForm(false);
      carregarIndividuos();
    } catch (error) {
      setErro(error.response?.data?.detail || 'Erro ao salvar indivíduo');
    } finally {
      setLoading(false);
    }
  };

  // Calcular índices para paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredIndividuals = individuals.filter(individual => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      
      if (key === 'status') {
        return individual[key] === filters[key];
      }
      
      return individual[key]?.toLowerCase().includes(filters[key].toLowerCase());
    });
  });
  const currentIndividuals = filteredIndividuals.slice(indexOfFirstItem, indexOfLastItem);

  // Handler para mudanças nos filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para editar indivíduo
  const handleEdit = (individual) => {
    setFormData(individual);
    setEditando(individual.id);
    setErro('');
    setMensagem('');
    setShowForm(true);
  };

  // Função para excluir indivíduo
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este indivíduo?')) {
      setLoading(true);
      try {
        const config = getAxiosConfig();
        if (!config) return;

        await axios.delete(`${API_URL}/individuos/${id}`, config);
        setMensagem('Indivíduo excluído com sucesso!');
        carregarIndividuos();
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setErro('Erro ao excluir indivíduo');
          console.error('Erro ao excluir indivíduo:', error);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={`p-6 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
      {/* Header */}
      <div className="flex justify-between items-center h-14 bg-white border-b px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium">Gestão de Indivíduos</h1>
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
            Novo Indivíduo
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

      {/* Área de Filtros */}
      {isFilterExpanded && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={baseStyles.filterLabel}>Nome</label>
              <input
                type="text"
                name="nome"
                value={filters.nome}
                onChange={handleFilterChange}
                className={baseStyles.input}
                placeholder="Filtrar por nome"
              />
            </div>
            <div>
              <label className={baseStyles.filterLabel}>CPF</label>
              <input
                type="text"
                name="cpf"
                value={filters.cpf}
                onChange={handleFilterChange}
                className={baseStyles.input}
                placeholder="Filtrar por CPF"
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
              {editando ? 'Editar Indivíduo' : 'Novo Indivíduo'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditando(null);
                setFormData({
                  nome: '',
                  cpf: '',
                  rg: '',
                  orgao_emissor: '',
                  data_emissao: '',
                  data_nascimento: '',
                  sexo: '',
                  estado_civil: '',
                  nacionalidade: '',
                  naturalidade: '',
                  profissao: '',
                  nome_pai: '',
                  nome_mae: '',
                  titulo_eleitor: '',
                  zona_eleitoral: '',
                  secao_eleitoral: '',
                  carteira_trabalho: '',
                  serie_ctps: '',
                  pis_pasep: '',
                  endereco: '',
                  numero: '',
                  complemento: '',
                  bairro: '',
                  cidade: '',
                  estado: '',
                  cep: '',
                  telefone: '',
                  celular: '',
                  email: '',
                  banco: '',
                  agencia: '',
                  conta: '',
                  tipo_conta: '',
                  status: 'ativo',
                  observacoes: ''
                });
                setErro('');
                setMensagem('');
              }}
              className={baseStyles.iconButton}
            >
              <X size={20} className="stroke-[1.5]" />
            </button>
          </div>

          {/* Formulário com scroll */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Dados Pessoais */}
                <div>
                  <label className={baseStyles.label}>Nome *</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className={baseStyles.input}
                    required
                  />
                </div>

                <div>
                  <label className={baseStyles.label}>CPF *</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    className={baseStyles.input}
                    required
                  />
                </div>

                <div>
                  <label className={baseStyles.label}>RG</label>
                  <input
                    type="text"
                    name="rg"
                    value={formData.rg}
                    onChange={handleChange}
                    className={baseStyles.input}
                  />
                </div>

                <div>
                  <label className={baseStyles.label}>Órgão Emissor</label>
                  <input
                    type="text"
                    name="orgao_emissor"
                    value={formData.orgao_emissor}
                    onChange={handleChange}
                    className={baseStyles.input}
                  />
                </div>

                <div>
                  <label className={baseStyles.label}>Data de Emissão</label>
                  <input
                    type="date"
                    name="data_emissao"
                    value={formData.data_emissao}
                    onChange={handleChange}
                    className={baseStyles.input}
                  />
                </div>

                <div>
                  <label className={baseStyles.label}>Data de Nascimento *</label>
                  <input
                    type="date"
                    name="data_nascimento"
                    value={formData.data_nascimento}
                    onChange={handleChange}
                    className={baseStyles.input}
                    required
                  />
                </div>

                <div>
                  <label className={baseStyles.label}>Sexo</label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    className={baseStyles.input}
                  >
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>

                <div>
                  <label className={baseStyles.label}>Estado Civil</label>
                  <select
                    name="estado_civil"
                    value={formData.estado_civil}
                    onChange={handleChange}
                    className={baseStyles.input}
                  >
                    <option value="">Selecione</option>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                  </select>
                </div>

                <div>
                  <label className={baseStyles.label}>Nacionalidade</label>
                  <input
                    type="text"
                    name="nacionalidade"
                    value={formData.nacionalidade}
                    onChange={handleChange}
                    className={baseStyles.input}
                  />
                </div>

                <div>
                  <label className={baseStyles.label}>Naturalidade</label>
                  <input
                    type="text"
                    name="naturalidade"
                    value={formData.naturalidade}
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
                  <label className={baseStyles.label}>Profissão</label>
                  <input
                    type="text"
                    name="profissao"
                    value={formData.profissao}
                    onChange={handleChange}
                    className={baseStyles.input}
                  />
                </div>

                {/* Continua com os demais campos... */}
                {/* Devido ao limite de caracteres, continuarei no próximo bloco */}
              </div>

              {/* Mensagens de erro/sucesso */}
              {(erro || mensagem) && (
                <div className={`mt-4 p-4 rounded-lg ${
                  erro ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}>
                  <div className="flex items-center gap-2">
                    {erro ? <X className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    <span className="text-sm font-medium">
                      {erro || mensagem}
                    </span>
                  </div>
                </div>
              )}

              {/* Botões do formulário */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditando(null);
                    setFormData({
                      nome: '',
                      cpf: '',
                      rg: '',
                      orgao_emissor: '',
                      data_emissao: '',
                      data_nascimento: '',
                      sexo: '',
                      estado_civil: '',
                      nacionalidade: '',
                      naturalidade: '',
                      profissao: '',
                      nome_pai: '',
                      nome_mae: '',
                      titulo_eleitor: '',
                      zona_eleitoral: '',
                      secao_eleitoral: '',
                      carteira_trabalho: '',
                      serie_ctps: '',
                      pis_pasep: '',
                      endereco: '',
                      numero: '',
                      complemento: '',
                      bairro: '',
                      cidade: '',
                      estado: '',
                      cep: '',
                      telefone: '',
                      celular: '',
                      email: '',
                      banco: '',
                      agencia: '',
                      conta: '',
                      tipo_conta: '',
                      status: 'ativo',
                      observacoes: ''
                    });
                    setErro('');
                    setMensagem('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: buttonColor }}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editando ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela */}
      {!showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className={baseStyles.tableHeader}>Nome</th>
                <th className={baseStyles.tableHeader}>CPF</th>
                <th className={baseStyles.tableHeader}>Email</th>
                <th className={baseStyles.tableHeader}>Telefone</th>
                <th className={baseStyles.tableHeader}>Status</th>
                <th className={baseStyles.tableHeader}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentIndividuals.map((individual) => (
                <tr key={individual.id} className="hover:bg-gray-50">
                  <td className={baseStyles.tableCell}>{individual.nome}</td>
                  <td className={baseStyles.tableCell}>{formatarCPF(individual.cpf)}</td>
                  <td className={baseStyles.tableCell}>{individual.email}</td>
                  <td className={baseStyles.tableCell}>{formatarTelefone(individual.telefone)}</td>
                  <td className={baseStyles.tableCell}>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      individual.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {individual.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className={baseStyles.tableCell}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(individual)}
                        className={baseStyles.iconButton}
                        title="Editar"
                      >
                        <Pen size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(individual.id)}
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
                {`${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredIndividuals.length)} de ${filteredIndividuals.length}`}
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
                  {currentPage} / {Math.ceil(filteredIndividuals.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredIndividuals.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredIndividuals.length / itemsPerPage)}
                  className={`${baseStyles.iconButton} disabled:opacity-30`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualsManagement; 