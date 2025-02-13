import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { 
  Bell, 
  LogOut, 
  User, 
  MessageSquareMore, 
  FileText, 
  HeadphonesIcon,
  Sun,
  Moon,
  Search,
  ChevronRight,
  Menu,
  TrendingUp,
  Leaf,
  Target,
  PieChart,
  Activity,
  ChevronDown
} from 'lucide-react';
import ChatBot from './ChatBot';
import { FaUser } from 'react-icons/fa';

const TopbarDropdown = ({ link, isOpen, toggleOpen }) => {
  const dropdownRef = useRef(null);
  const Icon = link.icon;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        toggleOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [toggleOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => toggleOpen(!isOpen)}
        className={`
          flex items-center gap-2 text-sm 
          text-gray-600 dark:text-gray-300
          hover:text-primary dark:hover:text-primary
          transition-colors
        `}
        title={link.description}
      >
        <Icon size={18} className="text-current" />
        <span>{link.name}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 py-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 min-w-[200px] z-50">
          {link.subItems.map((subItem) => (
            <Link
              key={subItem.path}
              to={subItem.path}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {subItem.icon && <subItem.icon size={16} />}
              {subItem.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Topbar = ({ onLogout, sidebarColor, fontColor, userName, role, isDarkMode, onToggleTheme, isSidebarCollapsed, setActiveMenuItem }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const quickLinks = [
    { 
      name: 'Contratos', 
      path: '/contracts',
      icon: FileText,
      description: 'Gestão de Contratos',
      subItems: [
        { name: 'Lista de Contratos', path: '/contracts/list' },
        { name: 'Novo Contrato', path: '/contracts/new' },
        { name: 'Versionamento', path: '/contracts/versions' },
        { name: 'Partes Envolvidas', path: '/contracts/parties' }
      ]
    },
    { 
      name: 'Análise IA', 
      path: '/ai-analysis',
      icon: TrendingUp,
      description: 'Análise de contratos por IA',
      subItems: [
        { name: 'Dashboard', path: '/ai-analysis/dashboard' },
        { name: 'Nova Análise', path: '/ai-analysis/new' },
        { name: 'Histórico', path: '/ai-analysis/history' },
        { name: 'Configurações', path: '/ai-analysis/settings' }
      ]
    },
    { 
      name: 'Issues', 
      path: '/issues',
      icon: Activity,
      description: 'Gestão de Issues',
      subItems: [
        { name: 'Painel de Issues', path: '/issues/dashboard' },
        { name: 'Issues Críticas', path: '/issues/critical' },
        { name: 'Em Revisão', path: '/issues/review' },
        { name: 'Resolvidas', path: '/issues/resolved' }
      ]
    },
    { 
      name: 'Colaboração', 
      path: '/collaboration',
      icon: MessageSquareMore,
      description: 'Área de Colaboração',
      subItems: [
        { name: 'Chat', path: '/collaboration/chat' },
        { name: 'Comentários', path: '/collaboration/comments' },
        { name: 'Aprovações', path: '/collaboration/approvals' },
        { name: 'Anexos', path: '/collaboration/attachments' }
      ]
    },
    { 
      name: 'Relatórios', 
      path: '/reports',
      icon: PieChart,
      description: 'Relatórios e Análises'
    },
    { 
      name: 'Auditoria', 
      path: '/audit',
      icon: Target,
      description: 'Trilha de Auditoria'
    }
  ];

  // Função para alternar o dropdown de notificações
  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  // Fechar o dropdown ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      style={{ backgroundColor: sidebarColor }}
      className={`
        h-12 
        flex 
        items-center 
        px-4
        fixed 
        top-0 
        ${isSidebarCollapsed ? 'left-16' : 'left-64'}
        right-0
        transition-all 
        duration-300 
        border-b
        z-50
      `}
    >
      {/* Links Rápidos */}
      <div className="flex items-center gap-6">
        {quickLinks.map((link) => (
          link.subItems ? (
            <TopbarDropdown
              key={link.path}
              link={link}
              isOpen={openDropdown === link.path}
              toggleOpen={(isOpen) => setOpenDropdown(isOpen ? link.path : null)}
            />
          ) : (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              title={link.description}
              onClick={() => setActiveMenuItem(link.path)}
            >
              <link.icon size={18} className="text-current" />
              <span>{link.name}</span>
            </Link>
          )
        ))}
      </div>

      {/* Lado direito: Pesquisa, Chat, Notificações e Usuário */}
      <div className="ml-auto flex items-center gap-4">
        {/* Botão de Pesquisa */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
          title="Pesquisar"
        >
          <Search size={18} />
        </button>

        {/* Chat Bot */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
          title="Chat"
        >
          <MessageSquareMore size={18} />
        </button>

        {/* Notificações */}
        <div ref={notificationRef} className="relative">
          <button
            onClick={toggleNotifications}
            className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
            title="Notificações"
          >
            <Bell size={18} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {/* ... dropdown de notificações permanece igual ... */}
        </div>

        {/* Alternador de Tema */}
        <button
          onClick={onToggleTheme}
          className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
          title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Menu do Usuário */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={18} className="text-primary" />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{userName}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{role}</div>
          </div>
        </div>

        {/* Botão de Logout */}
        <button
          onClick={onLogout}
          className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Chat Bot Component */}
      {isChatOpen && (
        <ChatBot onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
};

TopbarDropdown.propTypes = {
  link: PropTypes.shape({
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    description: PropTypes.string,
    subItems: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      icon: PropTypes.elementType
    }))
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired
};

Topbar.propTypes = {
  onLogout: PropTypes.func.isRequired,
  sidebarColor: PropTypes.string,
  fontColor: PropTypes.string,
  userName: PropTypes.string,
  role: PropTypes.string,
  isDarkMode: PropTypes.bool,
  onToggleTheme: PropTypes.func.isRequired,
  isSidebarCollapsed: PropTypes.bool,
  setActiveMenuItem: PropTypes.func
};
export default Topbar;

