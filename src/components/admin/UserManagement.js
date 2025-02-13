// src/components/admin/UserManagement.js

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
  Pen,
  Trash,
  HelpCircle,
  Type
} from 'lucide-react';

// Atualizar os estilos base para garantir consistência
const baseStyles = {
  input: "w-full px-3 py-2 text-base border rounded focus:ring-1 focus:outline-none transition-shadow",
  label: "block text-base font-medium text-gray-600 mb-1",
  headerButton: "px-3 py-1.5 text-base rounded-md flex items-center gap-1.5 transition-all",
  tableHeader: "px-3 py-2 text-base font-medium text-gray-600 border-b border-gray-100",
  tableCell: "px-3 py-2 text-base text-gray-800 border-b border-gray-100",
  filterLabel: "block text-base font-medium text-gray-600 mb-1",
  iconButton: "p-1 rounded-md hover:bg-gray-50 transition-colors"
};

// Definir colunas da tabela
const tableColumns = [
  { key: 'username', label: 'Username', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Função', sortable: true },
  { key: 'is_active', label: 'Status', sortable: true },
  { key: 'actions', label: 'Ações', sortable: false }
];

// Definir informações do tooltip
const helpInfo = {
  title: "Gerenciamento de Usuários",
  description: "Esta página permite gerenciar os usuários do sistema, incluindo criação, edição, exclusão e controle de permissões.",
  fields: [
    {
      name: "Username",
      description: "Identificador único do usuário para login",
      example: "Ex: joao.silva"
    },
    {
      name: "Email",
      description: "Email corporativo do usuário",
      example: "Ex: joao.silva@empresa.com"
    },
    {
      name: "Nome Completo",
      description: "Nome completo do usuário",
      example: "Ex: João Silva Santos"
    },
    {
      name: "Senha",
      description: "Senha de acesso (mínimo 8 caracteres)",
      example: "Ex: Senha@123"
    },
    {
      name: "Função",
      description: "Nível de acesso e permissões do usuário",
      options: [
        "Viewer - Apenas visualização",
        "Editor - Pode editar conteúdo",
        "Bond Manager - Gerencia títulos",
        "ESG Tracker - Rastreia métricas ESG",
        "Admin - Acesso total"
      ]
    },
    {
      name: "Status",
      description: "Estado atual da conta do usuário",
      options: [
        "Ativo - Usuário pode acessar o sistema",
        "Inativo - Acesso temporariamente suspenso"
      ]
    }
  ]
};

function UserManagement({ buttonColor, isSidebarCollapsed }) {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('viewer');
  const [isActive, setIsActive] = useState(true);
  const [newFullName, setNewFullName] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState('');
  const [itemsPerPage] = useState(10);

  // Remova full_name dos filtros
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    role: '',
    is_active: ''
  });

  // Adicionar estado para ordenação
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none'
  });

  // Calcular índices para paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'is_active' ? value : value
    }));
  };

  const filteredUsers = users.filter(user => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      
      if (key === 'is_active') {
        const userStatus = user[key] === true ? 'true' : 'false';
        return userStatus === filters[key];
      }
      
      return user[key]?.toLowerCase().includes(filters[key].toLowerCase());
    });
  });

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

  // Aplicar ordenação aos dados filtrados
  const sortedAndFilteredUsers = sortData(filteredUsers, sortConfig.key, sortConfig.direction);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Verificar se o token existe
      if (!token) {
        setError('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/login';
        return;
      }

      // Garantir que o token tenha o prefixo Bearer
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      console.log('Token sendo usado:', authToken); // Debug

      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true // Adicionar esta opção
      });
      
      console.log('Resposta da API:', response.data); // Debug
      
      if (response.data) {
        // Garantir que is_active seja sempre booleano
        const processedUsers = response.data.map(user => ({
          ...user,
          is_active: user.is_active === true
        }));
        
        setUsers(processedUsers);
        setError('');
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      console.error('Erro completo:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);

      if (err.response?.status === 401) {
        setError('Sessão expirada. Por favor, faça login novamente.');
        localStorage.removeItem('token'); // Limpar token inválido
        window.location.href = '/login';
        return;
      }

      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validar campos obrigatórios
    if (!newUsername || !newEmail || !newPassword || !newRole || !newFullName) {
        setError("Todos os campos são obrigatórios");
        setLoading(false);
        return;
    }

    const userData = {
        username: newUsername,
        email: newEmail,
        password: newPassword,
        role: newRole,
        full_name: newFullName,
        is_active: isActive
    };

    // Adicionar log para debug
    console.log('Dados sendo enviados:', {
        ...userData,
        password: '[REDACTED]'  // Não logar a senha
    });

    try {
        const response = await axios({
            method: 'post',
            url: `${API_URL}/users/`,
            data: userData,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Resposta do servidor:', response.data);
        alert('Usuário criado com sucesso!');
        resetForm();
        fetchUsers();
    } catch (error) {
        console.error('Erro detalhado:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        
        let errorMessage = 'Erro ao criar usuário';
        if (error.response?.data?.detail) {
            errorMessage = Array.isArray(error.response.data.detail) 
                ? error.response.data.detail.map(err => err.msg).join(', ')
                : error.response.data.detail;
        }
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
        try {
            await axios.delete(`${API_URL}/users/${userId}`);
            
            // Atualizar o estado local removendo o usuário excluído
            setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
            
            alert('Usuário excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            let errorMessage = 'Erro ao excluir usuário';
            
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.request) {
                errorMessage = 'Não foi possível conectar ao servidor';
            } else {
                errorMessage = error.message;
            }
            
            alert(errorMessage);
        }
    }
  };

  const handleEditUser = (user) => {
    console.log('Editando usuário (dados originais):', user);
    setEditingUser(user);
    setNewUsername(user.username);
    setNewEmail(user.email);
    setNewRole(user.role);
    setNewFullName(user.full_name);
    // Garantir valor booleano para is_active
    const activeStatus = user.is_active === true;
    console.log('Status ativo definido para:', activeStatus);
    setIsActive(activeStatus);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Garantir que is_active seja booleano
      const isActiveValue = isActive === true;
      console.log('Valor de is_active a ser enviado:', isActiveValue);
      
      const userData = {
        username: newUsername,
        email: newEmail,
        password: newPassword || undefined,
        role: newRole,
        is_active: isActiveValue,
        full_name: newFullName
      };

      console.log('Dados de atualização:', userData);

      const response = await axios.put(`${API_URL}/users/${editingUser.id}`, userData);
      console.log('Resposta da atualização:', response.data);
      
      alert('Usuário atualizado com sucesso!');
      resetForm();
      await fetchUsers(); // Usar await aqui
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setError(error.response?.data?.detail || 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar o resetForm para garantir que todos os campos sejam limpos
  const resetForm = () => {
    setEditingUser(null);
    setIsAddingUser(false);
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('viewer');
    setIsActive(true);
    setNewFullName('');
    setError(null);
  };

  // Adicionar função para limpar filtros
  const clearFilters = () => {
    setFilters({
      username: '',
      email: '',
      role: '',
      is_active: ''
    });
  };

  return (
    <div className={`fixed top-12 ${isSidebarCollapsed ? 'left-16' : 'left-64'} right-0 bottom-0 flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className="flex justify-between items-center h-14 bg-white border-b px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium">Gestão de Usuários</h1>
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
            onClick={() => setIsAddingUser(true)}
            style={{ backgroundColor: buttonColor }}
            className="px-3 py-1.5 text-sm text-white rounded-md hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <Plus size={16} />
            Novo Usuário
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
        {(editingUser !== null || isAddingUser) ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
            {/* Header do Formulário */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-medium text-gray-900">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} className="stroke-[1.5]" />
              </button>
            </div>

            {/* Corpo do Formulário com Scroll */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Username */}
                  <div>
                    <label className={baseStyles.label}>
                      Username
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className={baseStyles.input}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className={baseStyles.label}>
                      Email
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className={baseStyles.input}
                      required
                    />
                  </div>

                  {/* Nome Completo */}
                  <div>
                    <label className={baseStyles.label}>
                      Nome Completo
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className={baseStyles.input}
                      required
                    />
                  </div>

                  {/* Senha */}
                  <div>
                    <label className={baseStyles.label}>
                      Senha
                      {!editingUser && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={baseStyles.input}
                      required={!editingUser}
                    />
                  </div>

                  {/* Função */}
                  <div>
                    <label className={baseStyles.label}>
                      Função
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className={baseStyles.input}
                      required
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="bond_manager">Gerenciador de Títulos</option>
                      <option value="esg_tracker">Rastreador ESG</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className={baseStyles.label}>
                      Status
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={isActive === true ? 'true' : 'false'}
                      onChange={(e) => setIsActive(e.target.value === 'true')}
                      className={baseStyles.input}
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer do Formulário */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: buttonColor }}
              >
                {loading ? 'Processando...' : (editingUser ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Área de Filtros */}
            {isFilterExpanded && (
              <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={baseStyles.filterLabel}>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={filters.username}
                      onChange={handleFilterChange}
                      className={baseStyles.input}
                      placeholder="Filtrar por username"
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
                    <label className={baseStyles.filterLabel}>Função</label>
                    <select
                      name="role"
                      value={filters.role}
                      onChange={handleFilterChange}
                      className={baseStyles.input}
                    >
                      <option value="">Todos</option>
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="bond_manager">Gerenciador de Títulos</option>
                      <option value="esg_tracker">Rastreador ESG</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className={baseStyles.filterLabel}>Status</label>
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
                  {loading ? (
                    <tr>
                      <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-gray-500">
                        Carregando...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-red-500">
                        {error}
                      </td>
                    </tr>
                  ) : sortedAndFilteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumns.length} className="px-3 py-4 text-center text-gray-500">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    sortedAndFilteredUsers
                      .slice(indexOfFirstItem, indexOfLastItem)
                      .map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm text-gray-900">{user.username}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{user.email}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{user.role}</td>
                          <td className="px-3 py-2 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-gray-400 hover:text-gray-600"
                                title="Editar"
                              >
                                <Pen size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-gray-400 hover:text-red-600"
                                title="Excluir"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>

              {/* Paginação */}
              <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {`${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, sortedAndFilteredUsers.length)} de ${sortedAndFilteredUsers.length}`}
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
                      {currentPage} / {Math.ceil(sortedAndFilteredUsers.length / itemsPerPage)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(sortedAndFilteredUsers.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(sortedAndFilteredUsers.length / itemsPerPage)}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

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
                <h2 className="text-xl font-medium text-gray-900">{helpInfo.title}</h2>
              </div>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} className="stroke-[1.5]" />
              </button>
            </div>
            
            <div className="prose prose-sm max-w-none space-y-6">
              {/* Descrição */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-700 mb-0">{helpInfo.description}</p>
              </div>
              
              {/* Campos do Formulário */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-purple-100 p-1.5 rounded">
                    <Type size={16} className="text-purple-500" />
                  </span>
                  Campos do Formulário
                </h3>
                <div className="grid gap-4">
                  {helpInfo.fields.map((field) => (
                    <div 
                      key={field.name} 
                      className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                    >
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                        {field.name}
                      </h4>
                      <p className="text-gray-600 mt-2">{field.description}</p>
                      {field.example && (
                        <div className="mt-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded text-sm">
                          {field.example}
                        </div>
                      )}
                      {field.options && (
                        <ul className="mt-3 space-y-1">
                          {field.options.map((option) => (
                            <li 
                              key={option} 
                              className="flex items-center gap-2 text-sm text-gray-600"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                              {option}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Botão de Fechar */}
              <div className="pt-4 mt-6 border-t border-gray-100 text-center">
                <button
                  onClick={() => setShowHelp(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
                >
                  Fechar ajuda
                  <X size={16} className="stroke-[2]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default UserManagement;

