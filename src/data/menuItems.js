import React from 'react';
import {
  Home,
  FileText,
  Settings,
  Users,
  Palette,
  HelpCircle,
  Bell
} from 'lucide-react';

// Menu principal da Sidebar
export const menuItems = [
  {
    name: 'Home',
    path: '/',
    icon: <Home size={20} />,
    description: 'Dashboard principal'
  },
  {
    name: 'Administração',
    icon: <Settings size={20} />,
    path: '/admin',
    description: 'Configurações do sistema',
    subItems: [
      { 
        name: 'Usuários', 
        icon: <Users size={20} />, 
        path: '/admin/user-management',
        description: 'Gestão de usuários'
      },
      { 
        name: 'Personalização', 
        icon: <Palette size={20} />, 
        path: '/admin/customization',
        description: 'Personalizar interface'
      }
    ]
  },
  {
    name: 'Contratos',
    icon: <FileText size={20} />,
    path: '/pages/contracts',
    description: 'Gestão de contratos'
  }
];

// Links rápidos para a Topbar
export const topbarLinks = [
  {
    name: 'Notificações',
    path: '/notifications',
    icon: <Bell size={16} />,
    description: 'Ver notificações'
  },
  {
    name: 'Ajuda',
    path: '/help',
    icon: <HelpCircle size={16} />,
    description: 'Central de ajuda'
  }
];

// Status e constantes
export const CONTRACT_STATUS = {
  draft: {
    label: 'Rascunho',
    color: 'gray'
  },
  under_review: {
    label: 'Em Revisão',
    color: 'yellow'
  },
  active: {
    label: 'Ativo',
    color: 'green'
  },
  expired: {
    label: 'Expirado',
    color: 'red'
  }
};

export const RISK_LEVELS = {
  low: {
    label: 'Baixo',
    color: 'green'
  },
  medium: {
    label: 'Médio',
    color: 'yellow'
  },
  high: {
    label: 'Alto',
    color: 'orange'
  },
  critical: {
    label: 'Crítico',
    color: 'red'
  }
};

export default menuItems;

