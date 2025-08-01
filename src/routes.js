import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Principal from './pages/Principal';
import Vendas from './pages/Vendas';
import Produtos from './pages/Produtos';
import Clientes from './pages/Clientes';
import Configuracoes from './pages/Configuracoes';
import FaleConosco from './pages/FaleConosco';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { getUsuarioLogado } from './functions/auth';

// Componente para proteger rotas
const ProtectedRoute = ({ children }) => {
  const usuario = getUsuarioLogado();
  return usuario ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/fale-conosco" element={<FaleConosco />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Rotas protegidas */}
        <Route 
          path="/principal" 
          element={
            <ProtectedRoute>
              <Principal />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vendas" 
          element={
            <ProtectedRoute>
              <Vendas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/produtos" 
          element={
            <ProtectedRoute>
              <Produtos />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/clientes" 
          element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/configuracoes" 
          element={
            <ProtectedRoute>
              <Configuracoes />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirecionamento padrão */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
