import React, { useState } from 'react';
import { FaHome, FaMoneyBillWave, FaMoneyCheckAlt, FaSignOutAlt, FaEnvelope, FaWallet, FaCalendarAlt, FaCalendarWeek, FaCalculator, FaCreditCard, FaChartPie, FaTags, FaChartLine } from 'react-icons/fa';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { logout } from '../functions/auth';
import Header from '../components/Header';
import LembreteEventoProvider from '../components/LembreteEventoProvider';

const MENU_ITEMS = [
  { key: 'home', path: '/layout/principal', match: ['/layout/principal', '/layout/resumo-financeiro'], icon: FaHome, label: 'Home', title: 'Home', color: '#2563EB' },
  { key: 'dashboard', path: '/layout/dashboard', match: ['/layout/dashboard'], icon: FaChartLine, label: 'Dashboard', title: 'Dashboard', color: '#7C3AED' },
  { key: 'contas', path: '/layout/contas', match: ['/layout/contas'], icon: FaWallet, label: 'Contas', title: 'Contas', color: '#0EA5E9' },
  { key: 'receita', path: '/layout/receita', match: ['/layout/receita'], icon: FaMoneyBillWave, label: 'Receitas', title: 'Receitas', color: '#059669' },
  { key: 'despesa', path: '/layout/despesa', match: ['/layout/despesa'], icon: FaMoneyCheckAlt, label: 'Despesas', title: 'Despesas', color: '#DC2626' },
  { key: 'calendario', path: '/layout/calendario', match: ['/layout/calendario'], icon: FaCalendarAlt, label: 'Calendário', title: 'Calendário Financeiro', color: '#2563EB' },
  { key: 'agenda', path: '/layout/agenda', match: ['/layout/agenda'], icon: FaCalendarWeek, label: 'Agenda', title: 'Agenda Pessoal', color: '#8B5CF6' },
  { key: 'cartoes', path: '/layout/cartoes', match: ['/layout/cartoes'], icon: FaCreditCard, label: 'Cartões', title: 'Cartões de Crédito', color: '#D97706' },
  { key: 'orcamento', path: '/layout/orcamento', match: ['/layout/orcamento'], icon: FaChartPie, label: 'Orçamento', title: 'Orçamento Mensal', color: '#EC4899' },
  { key: 'categorias', path: '/layout/categorias', match: ['/layout/categorias'], icon: FaTags, label: 'Categorias', title: 'Categorias', color: '#14B8A6' },
  { key: 'calculadoras', path: '/layout/calculadora-juros', match: ['/layout/calculadora-juros', '/layout/calculadora-retiradas', '/layout/calculadora-aporte-meta'], icon: FaCalculator, label: 'Calculadoras', title: 'Calculadoras', color: '#4F46E5' },
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
      <nav className="sidebar sidebar--panel">
        <div className="sidebar-brand">
          <svg
            className="sidebar-brand__logo"
            width="36"
            height="36"
            viewBox="0 0 40 40"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="sidebarClaricashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="18" fill="url(#sidebarClaricashGradient)" />
            <path d="M12 15 L20 12 L28 15 L20 18 Z" fill="white" opacity="0.9" />
            <path d="M12 20 L20 17 L28 20 L20 23 Z" fill="white" opacity="0.7" />
            <path d="M12 25 L20 22 L28 25 L20 28 Z" fill="white" opacity="0.5" />
            <text x="20" y="18" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">$</text>
          </svg>
          <span className="sidebar-brand__text">Claricash</span>
        </div>
        <div className="sidebar-nav">
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
                style={{ cursor: 'pointer', '--item-color': item.color }}
                title={item.title}
              >
                <span className="icon" style={{ color: active ? '#fff' : item.color }}>
                  <Icon />
                </span>
                <span className="label">{item.label}</span>
              </div>
            );
          })}
        </div>
        <div className="sidebar-footer">
          <div
            className={`sidebar-item ${hovered === 'fale-conosco' ? 'hovered' : ''} ${location.pathname === '/fale-conosco' ? 'active' : ''}`}
            onMouseEnter={() => setHovered('fale-conosco')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate('/fale-conosco')}
            style={{ cursor: 'pointer', '--item-color': '#64748B' }}
            title="Fale Conosco"
          >
            <span className="icon" style={{ color: location.pathname === '/fale-conosco' ? '#fff' : '#64748B' }}>
              <FaEnvelope />
            </span>
            <span className="label">Fale Conosco</span>
          </div>
          <div
            className={`sidebar-item sidebar-item--logout ${hovered === 'logout' ? 'hovered' : ''}`}
            onMouseEnter={() => setHovered('logout')}
            onMouseLeave={() => setHovered(null)}
            onClick={handleSair}
            style={{ cursor: 'pointer', '--item-color': '#DC2626' }}
            title="Sair"
          >
            <span className="icon" style={{ color: '#DC2626' }}>
              <FaSignOutAlt />
            </span>
            <span className="label">Sair</span>
          </div>
        </div>
      </nav>
      <main className="main-content main-content--with-panel">
        <Outlet />
      </main>
    </div>
    </LembreteEventoProvider>
  );
}

export default Layout;
