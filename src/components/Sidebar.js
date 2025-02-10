// Sidebar.js
import React, { useState } from 'react';
import { Menu, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// Adicionar estilos base para o menu
const menuStyles = {
  menuItem: "flex items-center w-full px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
  subMenuItem: "flex items-center w-full px-3 py-1.5 text-xs font-medium rounded-md pl-6 transition-colors",
  icon: "w-3.5 h-3.5 stroke-[1.5]",
  chevron: "w-3.5 h-3.5 stroke-[1.5] opacity-50",
};

function Sidebar({
  menuItems,
  activeMenuItem,
  setActiveMenuItem,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  sidebarColor,
  buttonColor,
  fontColor,
  userRole,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado para controlar múltiplos submenus
  const [openMenus, setOpenMenus] = useState({});

  // Função para alternar submenu específico
  const toggleSubmenu = (menuName) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  // Função atualizada para verificar se um item está ativo
  const isItemActive = (item) => {
    // Se for um item sem submenus, verifica apenas o path atual
    if (!item.subItems) {
      return location.pathname === item.path;
    }
    
    // Se for um item com submenus, verifica se o path atual corresponde exatamente ao path do item pai
    if (location.pathname === item.path) {
      return true;
    }

    // Para itens com submenus, verifica se algum submenu está ativo
    // mas NÃO marca o item pai como ativo
    if (item.subItems) {
      return false; // Não marca o pai como ativo quando um filho está selecionado
    }

    return false;
  };

  // Função para verificar se um submenu está ativo
  const isSubItemActive = (subItem) => {
    return location.pathname === subItem.path;
  };

  // Função para renderizar cada item do menu
  const renderMenuItem = (item, isSubItem = false) => {
    const isActive = isSubItem ? isSubItemActive(item) : isItemActive(item);
    const isOpen = openMenus[item.name];

    return (
      <li key={item.path || item.name}>
        <button
          onClick={() => {
            if (item.subItems) {
              toggleSubmenu(item.name);
            } else {
              handleClick(item.path);
            }
          }}
          style={{
            backgroundColor: isActive ? buttonColor : 'transparent',
            color: isActive ? '#FFFFFF' : fontColor,
          }}
          className={`${isSubItem ? menuStyles.subMenuItem : menuStyles.menuItem} ${
            isActive ? 'shadow-sm' : 'hover:bg-gray-700/10'
          }`}
        >
          {/* Ícone do item */}
          {item.icon && (
            <span className={`${isActive ? 'opacity-100' : 'opacity-50'}`}>
              {React.cloneElement(item.icon, { 
                size: 14,
                className: menuStyles.icon
              })}
            </span>
          )}

          {/* Nome do item */}
          {!isSidebarCollapsed && (
            <>
              <span className="text-sm ml-2 truncate">{item.name}</span>
              {item.subItems && (
                <span className="ml-auto">
                  {isOpen ? (
                    <ChevronDown size={14} className={menuStyles.chevron} />
                  ) : (
                    <ChevronRight size={14} className={menuStyles.chevron} />
                  )}
                </span>
              )}
            </>
          )}
        </button>

        {/* Subitens */}
        {!isSidebarCollapsed && item.subItems && isOpen && (
          <ul className="mt-0.5 mb-1 ml-2 space-y-0.5">
            {item.subItems.map((subItem) => renderMenuItem(subItem, true))}
          </ul>
        )}
      </li>
    );
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleClick = (path) => {
    setActiveMenuItem(path);
    navigate(path);
  };

  return (
    <aside
      style={{ backgroundColor: sidebarColor }}
      className={`transition-all duration-300 ease-in-out fixed top-0 left-0 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      } h-screen z-50 shadow-sm`}
    >
      {/* Header da Sidebar */}
      <div className="flex items-center justify-between h-12 px-3 border-b border-gray-700/10">
        {!isSidebarCollapsed && (
          <div className="flex items-center">
            <div className="flex items-center justify-center p-1.5">
              <img 
                src="/logo.png"
                alt="Logo" 
                className="h-7 w-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/logo.svg";
                }}
              />
            </div>
            <span style={{ color: fontColor }} className="text-sm font-medium ml-2">
              ESG Dashboard
            </span>
          </div>
        )}
        <button 
          onClick={handleToggleSidebar}
          style={{ color: fontColor }} 
          className="p-1 rounded-md hover:bg-gray-700/10 transition-colors focus:outline-none"
        >
          <Menu size={14} className="opacity-50 stroke-[1.5]" />
        </button>
      </div>

      {/* Menu de Navegação */}
      <nav className="mt-2 overflow-y-auto" style={{ height: 'calc(100vh - 3rem)' }}>
        <ul className="px-2 space-y-0.5">
          {menuItems.map((item) => renderMenuItem(item))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
