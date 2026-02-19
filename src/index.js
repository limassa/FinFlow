import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Cadastro from './pages/Cadastro';
import Login from './pages/Login';
import Home from './pages/Home';  
import Principal from './pages/Principal';
import Receita from './pages/Receita';
import Despesa from './pages/Despesa';
import FaleConosco from './pages/FaleConosco';
import Contas from './pages/Contas';
import Calendario from './pages/Calendario';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Configuracoes from './pages/Configuracoes';
import Sobre from './pages/Sobre';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DetalhesGrafico from './pages/DetalhesGrafico';
import CalculadoraJuros from './pages/CalculadoraJuros';
import CalculadoraRetiradas from './pages/CalculadoraRetiradas';
import CalculadoraAporteMeta from './pages/CalculadoraAporteMeta';
import PrivacyPolicy from './pages/PrivacyPolicy';

import reportWebVitals from './reportWebVitals';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/fale-conosco" element={<FaleConosco />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/calculadora-juros" element={<CalculadoraJuros />} />
        <Route path="/calculadora-retiradas" element={<CalculadoraRetiradas />} />
        <Route path="/calculadora-aporte-meta" element={<CalculadoraAporteMeta />} />
        <Route path="/app" element={<App />}/>
        <Route path="/layout" element={<Layout />}>
          <Route path="principal" element={<Principal />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="sobre" element={<Sobre />} />
          <Route path="receita" element={<Receita />} />
          <Route path="despesa" element={<Despesa />} />
          <Route path="contas" element={<Contas />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="detalhes-grafico" element={<DetalhesGrafico />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
