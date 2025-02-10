import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { 
  Menu,
  Bell,
  Sun,
  Moon,
  Search,
  Filter,
  Calendar,
  BarChart,
  FileText,
  Leaf,
  Target,
  ListChecks,
  ClipboardList,
  TrendingUp,
  PieChart,
  Activity
} from 'lucide-react';

export function Topbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();

  const quickLinks = [
    { 
      name: 'KPI', 
      path: '/kpi-tracker',
      icon: TrendingUp,
      description: 'Indicadores de Performance'
    },
    { 
      name: 'Títulos', 
      path: '/bonds/list',
      icon: FileText,
      description: 'Lista de Títulos'
    },
    { 
      name: 'Projetos', 
      path: '/esg-tracker/projects',
      icon: Target,
      description: 'Projetos ESG'
    },
    { 
      name: 'Relatório ESG', 
      path: '/bonds/sustainability-report',
      icon: Leaf,
      description: 'Relatório de Sustentabilidade'
    },
    { 
      name: 'Portfólio ODS', 
      path: '/bonds/portfolio-ods',
      icon: PieChart,
      description: 'Portfólio ODS'
    },
    { 
      name: 'Plano de Ação', 
      path: '/action-plan',
      icon: Activity,
      description: 'Plano de Ação'
    }
  ];

  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Quick Links */}
      <div className="h-10 flex items-center gap-4 px-4 border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              title={link.description}
            >
              <Icon size={16} />
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Main Toolbar */}
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu size={20} />
          </button>

          {/* Global Search with Filters */}
          <div className="relative flex items-center">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar contratos, análises..."
                className="pl-10 pr-4 py-2 w-[400px] rounded-l-md bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button 
              className="p-2 h-full rounded-r-md bg-gray-100 dark:bg-gray-700 border-l border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Filtros avançados"
            >
              <Filter size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Date Range */}
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <Calendar size={16} />
            <span>Últimos 30 dias</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <button 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            title="Notificações"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.name?.[0] || 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Topbar.propTypes = {
  onMenuClick: PropTypes.func.isRequired
}; 