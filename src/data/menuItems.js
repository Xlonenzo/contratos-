import React from 'react';
import {
  Home,
  FileText,
  Settings,
  Users,
  Palette
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
    name: 'Contratos',
    icon: <FileText size={20} />,
    path: '/pages/contracts',
    description: 'Gestão de contratos'
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
  }
];

// Remover topbarLinks que não está sendo usado
// export const topbarLinks = [
//   {
//     name: 'Notificações',
//     path: '/notifications',
//     icon: <Bell size={16} />,
//     description: 'Ver notificações'
//   },
//   {
//     name: 'Ajuda',
//     path: '/help',
//     icon: <HelpCircle size={16} />,
//     description: 'Central de ajuda'
//   }
// ];

// Remover exports não utilizados
// export const CONTRACT_STATUS = { ... };
// export const RISK_LEVELS = { ... };

export default menuItems;

