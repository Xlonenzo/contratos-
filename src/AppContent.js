import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from './config';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginPage from './components/LoginPage';
import Register from './components/Register';
import UserManagement from './components/admin/UserManagement';
import Customization from './components/Customization';
import HomeContent from './components/HomeContent';
import { menuItems } from './data/menuItems';
import ContractsManagement from './pages/contracts/ContractsManagement';
import EmpresasManagement from './pages/empresas/EmpresasManagement';
import IndividualsManagement from './pages/individuos/IndividualsManagement';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('/');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [customization, setCustomization] = useState({
    sidebar_color: '#ffffff',
    button_color: '#3490dc',
    font_color: '#333333'
  });

  const navigate = useNavigate();

  // Verificar se já existe um token ao carregar a página
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUserName = localStorage.getItem('userName');
    const savedUserRole = localStorage.getItem('userRole');
    
    if (token && savedUserName && savedUserRole) {
      setIsLoggedIn(true);
      setUserName(savedUserName);
      setUserRole(savedUserRole);
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('token', userData.access_token);
    localStorage.setItem('userName', userData.username);
    localStorage.setItem('userRole', userData.role);
    
    setIsLoggedIn(true);
    setUserName(userData.username);
    setUserRole(userData.role);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    
    setIsLoggedIn(false);
    setUserName('');
    setUserRole('');
    navigate('/login');
  };

  const handleRegister = (userData) => {
    setIsLoggedIn(true);
    setIsRegistering(false);
    setUserName(userData.username);
    setUserRole(userData.role);
  };

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  console.log('Current path:', window.location.pathname); // Debug

  if (!isLoggedIn) {
    if (isRegistering) {
      return <Register onRegister={handleRegister} onCancel={() => setIsRegistering(false)} />;
    }
    return <LoginPage onLogin={handleLogin} onRegisterClick={() => setIsRegistering(true)} />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        menuItems={menuItems}
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        sidebarColor={customization.sidebar_color}
        buttonColor={customization.button_color}
        fontColor={customization.font_color}
        userRole={userRole}
      />
      
      <div className="flex-1 flex flex-col">
        <Topbar
          onLogout={handleLogout}
          sidebarColor={customization.sidebar_color}
          fontColor={customization.font_color}
          userName={userName}
          role={userRole}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          isSidebarCollapsed={isSidebarCollapsed}
          setActiveMenuItem={setActiveMenuItem}
        />
        
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<HomeContent />} />
            <Route 
              path="/admin/user-management" 
              element={
                <UserManagement 
                  buttonColor={customization.button_color}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
              } 
            />
            <Route 
              path="/admin/customization" 
              element={
                <Customization 
                  customization={customization}
                  setCustomization={setCustomization}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
              } 
            />
            <Route 
              path="/pages/contracts" 
              element={
                <ContractsManagement 
                  buttonColor={customization.button_color}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
              } 
            />
            <Route 
              path="/pages/empresas" 
              element={
                <EmpresasManagement 
                  buttonColor={customization.button_color}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
              } 
            />
            <Route 
              path="/pages/individuos" 
              element={
                <IndividualsManagement 
                  buttonColor={customization.button_color}
                  isSidebarCollapsed={isSidebarCollapsed}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default AppContent; 