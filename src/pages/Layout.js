import React, { useState } from 'react';
import { FaHome, FaMoneyBillWave, FaMoneyCheckAlt, FaSignOutAlt, FaEnvelope, FaWallet, FaCalendarAlt, FaCalendarWeek, FaCalculator, FaCreditCard, FaChartPie, FaTags, FaChartLine } from 'react-icons/fa';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { logout } from '../functions/auth';
import Header from '../components/Header';
import LembreteEventoProvider from '../components/LembreteEventoProvider';

const MENU_ITEMS = [
  { key: 'home', path: '/layout/principal', match: ['/layout/principal', '/layout/resumo-financeiro'], icon: FaHome, label: 'Home', title: 'Home' },
  { key: 'dashboard', path: '/layout/dashboard', match: ['/layout/dashboard'], icon: FaChartLine, label: 'Dashboard', title: 'Dashboard' },
  { key: 'contas', path: '/layout/contas', match: ['/layout/contas'], icon: FaWallet, label: 'Contas', title: 'Contas' },
  { key: 'receita', path: '/layout/receita', match: ['/layout/receita'], icon: FaMoneyBillWave, label: 'Receita', title: 'Receita' },
  { key: 'despesa', path: '/layout/despesa', match: ['/layout/despesa'], icon: FaMoneyCheckAlt, label: 'Despesa', title: 'Despesa' },
  { key: 'calendario', path: '/layout/calendario', match: ['/layout/calendario'], icon: FaCalendarAlt, label: 'Calendário', title: 'Calendário' },
  { key: 'agenda', path: '/layout/agenda', match: ['/layout/agenda'], icon: FaCalendarWeek, label: 'Agenda', title: 'Agenda' },
  { key: 'cartoes', path: '/layout/cartoes', match: ['/layout/cartoes'], icon: FaCreditCard, label: 'Cartões', title: 'Cartões de Crédito' },
  { key: 'orcamento', path: '/layout/orcamento', match: ['/layout/orcamento'], icon: FaChartPie, label: 'Orçamento', title: 'Orçamento Mensal' },
  { key: 'categorias', path: '/layout/categorias', match: ['/layout/categorias'], icon: FaTags, label: 'Categorias', title: 'Categorias' },
  { key: 'calculadoras', path: '/layout/calculadora-juros', match: ['/layout/calculadora-juros', '/layout/calculadora-retiradas', '/layout/calculadora-aporte-meta'], icon: FaCalculator, label: 'Calculadoras', title: 'Calculadoras' },
];

function Layout() {
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSair = () => {
    logout();
    navigate('/');
  };

  const isActive = (item) =>
    (item.match || [item.path]).some(
      (p) => location.pathname === p || location.pathname.startsWith(`${p}/`)
    );

  return (
    <LembreteEventoProvider>
    <div className="home-container">
      <Header />
      <nav className="sidebar">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <div
              key={item.key}
              className={`sidebar-item ${hovered === item.key ? 'hovered' : ''} ${active ? 'active' : ''}`}
              onMouseEnter={() => setHovered(item.key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate(item.path)}
              style={{ cursor: 'pointer' }}
              title={item.title}
            >
              <span className="icon"><Icon /></span>
              <span className="label">{(hovered === item.key || active) && item.label}</span>
            </div>
          );
        })}
        <div className={`sidebar-item ${hovered === 'fale-conosco' ? 'hovered' : ''} ${location.pathname === '/fale-conosco' ? 'active' : ''}`}
        onMouseEnter={() => setHovered('fale-conosco')}
        onMouseLeave={() => setHovered(null)}
        onClick={() => navigate('/fale-conosco')}
        style={{ cursor: 'pointer', marginTop: 'auto', marginBottom: '20px' }}
        title="Fale Conosco">
            <span className="icon"><FaEnvelope /></span>
            <span className="label">{hovered === 'fale-conosco' && 'Fale Conosco'}</span>
        </div>
        <div className={`sidebar-item ${hovered === 'logout' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('logout')}
        onMouseLeave={() => setHovered(null)}
        onClick={handleSair}
        style={{ cursor: 'pointer' }}
        title="Sair">
            <span className="icon"><FaSignOutAlt /></span>
            <span className="label">{hovered === 'logout' && 'Sair'}</span>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
    </LembreteEventoProvider>
  );
}

export default Layout;
