import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import AppContent from './AppContent';

// Importar componentes
import HomeContent from './components/HomeContent';
import AdminContent from './components/AdminContent';
import UserManagement from './components/admin/UserManagement';
import LoginPage from './components/LoginPage';
import Customization from './components/Customization';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Register from './components/Register';

// Importar dados e estilos
import menuItemsData from './data/menuItems';
import './index.css';

// Importar configuração
import { API_URL } from './config';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

// Componente para exibir mensagem de acesso não autorizado
const UnauthorizedAccess = () => (
  <div className="text-red-600 font-bold">
    Acesso não autorizado. Você não tem permissão para visualizar esta página.
  </div>
);
