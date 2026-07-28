import React, { useState } from 'react';
import { FaHome, FaMoneyBillWave, FaMoneyCheckAlt, FaSignOutAlt, FaEnvelope, FaWallet, FaCalendarAlt, FaCalendarWeek, FaCalculator, FaCreditCard, FaChartPie, FaTags, FaChartLine } from 'react-icons/fa';
import { useNavigate, Outlet } from 'react-router-dom';
import { logout } from '../functions/auth';
import Header from '../components/Header';
import LembreteEventoProvider from '../components/LembreteEventoProvider';

function Layout() {
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  const handleSair = () => {
    logout();
    navigate('/');
  };

  return (
    <LembreteEventoProvider>
    <div className="home-container">
      <Header />
      <nav className="sidebar">
        <div className={`sidebar-item ${hovered === 'home' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('home')}
        onMouseLeave={() => setHovered(null)}
            onClick={() => navigate('/layout/principal')}
        style={{ cursor: 'pointer' }}
        title="Home">
            <span className="icon"><FaHome /></span>
            <span className="label">{hovered === 'home' && 'Home'}</span>
        </div>
        <div className={`sidebar-item ${hovered === 'dashboard' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('dashboard')}
        onMouseLeave={() => setHovered(null)}
            onClick={() => navigate('/layout/dashboard')}
        style={{ cursor: 'pointer' }}
        title="Dashboard">
            <span className="icon"><FaChartLine /></span>
            <span className="label">{hovered === 'dashboard' && 'Dashboard'}</span>
        </div>
        <div className={`sidebar-item ${hovered === 'contas' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('contas')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/contas')}
        style={{ cursor: 'pointer' }}
        title="Contas">
            <span className="icon"><FaWallet /></span>
            <span className="label">{hovered === 'contas' && 'Contas'}</span>
        </div>
        <div className={`sidebar-item ${hovered === 'receita' ? 'hovered' : ''}`}   
        onMouseEnter={() => setHovered('receita')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/receita')}
        style={{ cursor: 'pointer' }}
        title="Receita">
            <span className="icon"><FaMoneyBillWave /></span>
            <span className="label">{hovered === 'receita' && 'Receita'}</span>
        </div>
        <div className={`sidebar-item ${hovered === 'despesa' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('despesa')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/despesa')}
        style={{ cursor: 'pointer' }}
        title="Despesa">
            <span className="icon"><FaMoneyCheckAlt /></span>
            <span className="label">{hovered === 'despesa' && 'Despesa'}</span>
        </div>
        <div className={`sidebar-item ${hovered === 'calendario' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('calendario')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/calendario')}
        style={{ cursor: 'pointer' }}
        title="Calendário">
            <span className="icon"><FaCalendarAlt /></span>
            <span className="label">{hovered === 'calendario' && 'Calendário'}</span>
        </div>
        <div className={`sidebar-item ${hovered === 'agenda' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('agenda')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/agenda')}
        style={{ cursor: 'pointer' }}
        title="Agenda">
            <span className="icon"><FaCalendarWeek /></span>
            <span className="label">{hovered === 'agenda' && 'Agenda'}</span>
        </div>
        <div className={`sidebar-item ${hovered === 'cartoes' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('cartoes')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/cartoes')}
        style={{ cursor: 'pointer' }}
        title="Cartões de Crédito">
            <span className="icon"><FaCreditCard /></span>
            <span className="label">{hovered === 'cartoes' && 'Cartões'}</span>
        </div>
        <div className={`sidebar-item ${hovered === 'orcamento' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('orcamento')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/orcamento')}
        style={{ cursor: 'pointer' }}
        title="Orçamento Mensal">
            <span className="icon"><FaChartPie /></span>
            <span className="label">{hovered === 'orcamento' && 'Orçamento'}</span>
        </div>
        <div className={`sidebar-item ${hovered === 'categorias' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('categorias')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/categorias')}
        style={{ cursor: 'pointer' }}
        title="Categorias">
            <span className="icon"><FaTags /></span>
            <span className="label">{hovered === 'categorias' && 'Categorias'}</span>
        </div>
        <div className={`sidebar-item ${hovered === 'calculadoras' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('calculadoras')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/calculadora-juros')}
        style={{ cursor: 'pointer' }}
        title="Calculadoras">
            <span className="icon"><FaCalculator /></span>
            <span className="label">{hovered === 'calculadoras' && 'Calculadoras'}</span>
        </div>
        <div className={`sidebar-item ${hovered === 'fale-conosco' ? 'hovered' : ''}`}
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
