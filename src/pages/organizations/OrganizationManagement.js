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
  Building2,
  HelpCircle,
  Pen,
  Trash
} from 'lucide-react';

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
  { key: 'org_name', label: 'Nome', sortable: true },
  { key: 'org_type', label: 'Tipo', sortable: true },
  { key: 'tax_identification_number', label: 'CNPJ/CPF', sortable: true },
  { key: 'city', label: 'Cidade', sortable: true },
  { key: 'state', label: 'Estado', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Ações', sortable: false }
];

// Tipos de organização
const ORG_TYPES = [
  { value: 'LLC', label: 'Sociedade Limitada' },
  { value: 'Corporation', label: 'Sociedade Anônima' },
  { value: 'NGO', label: 'ONG' },
  { value: 'Individual', label: 'Pessoa Física' },
  { value: 'Government', label: 'Órgão Público' }
];

function OrganizationManagement({ buttonColor, isSidebarCollapsed }) {
  // Estados
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingOrg, setIsAddingOrg] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Estado do formulário
  const [formData, setFormData] = useState({
    org_name: '',
    org_type: '',
    jurisdiction: '',
    tax_identification_number: '',
    cnae_code: '',
    cnae_description: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    contact_phone: '',
    contact_email: '',
    primary_contact_person: '',
    industry: '',
    website_url: '',
    linkedin_url: '',
    founding_date: '',
    parent_org_id: '',
    social_security_number: '',
    status: 'Active'
  });

  // Filtros
  const [filters, setFilters] = useState({
    org_name: '',
    org_type: '',
    tax_identification_number: '',
    status: ''
  });

  // Ordenação
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none'
  });

  // Buscar organizações
  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/organizations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOrganizations(response.data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar organizações:', err);
      setError('Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Criar/Editar organização
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (editingOrg) {
        await axios.put(`${API_URL}/organizations/${editingOrg.org_id}`, formData, { headers });
      } else {
        await axios.post(`${API_URL}/organizations`, formData, { headers });
      }

      fetchOrganizations();
      setIsAddingOrg(false);
      setEditingOrg(null);
      setFormData({
        org_name: '',
        org_type: '',
        jurisdiction: '',
        tax_identification_number: '',
        cnae_code: '',
        cnae_description: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        contact_phone: '',
        contact_email: '',
        primary_contact_person: '',
        industry: '',
        website_url: '',
        linkedin_url: '',
        founding_date: '',
        parent_org_id: '',
        social_security_number: '',
        status: 'Active'
      });
    } catch (err) {
      console.error('Erro ao salvar organização:', err);
      setError('Erro ao salvar organização');
    }
  };

  // Renderizar formulário
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Informações Básicas */}
        <div>
          <label className={baseStyles.label}>Nome da Organização *</label>
          <input
            type="text"
            required
            className={baseStyles.input}
            value={formData.org_name}
            onChange={(e) => setFormData(prev => ({ ...prev, org_name: e.target.value }))}
          />
        </div>

        <div>
          <label className={baseStyles.label}>Tipo de Organização</label>
          <select
            className={baseStyles.input}
            value={formData.org_type}
            onChange={(e) => setFormData(prev => ({ ...prev, org_type: e.target.value }))}
          >
            <option value="">Selecione...</option>
            {ORG_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={baseStyles.label}>CNPJ/CPF *</label>
          <input
            type="text"
            required
            className={baseStyles.input}
            value={formData.tax_identification_number}
            onChange={(e) => setFormData(prev => ({ ...prev, tax_identification_number: e.target.value }))}
          />
        </div>

        {/* ... outros campos do formulário ... */}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={() => {
            setIsAddingOrg(false);
            setEditingOrg(null);
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
          {editingOrg ? 'Salvar Alterações' : 'Criar Organização'}
        </button>
      </div>
    </form>
  );

  return (
    <div className={`fixed top-12 ${isSidebarCollapsed ? 'left-16' : 'left-64'} right-0 bottom-0 flex flex-col transition-all duration-300`}>
      {/* ... resto do componente seguindo o mesmo padrão do UserManagement ... */}
    </div>
  );
}

export default OrganizationManagement; 