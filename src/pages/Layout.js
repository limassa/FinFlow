import React, { useState } from 'react';
import { FaHome, FaMoneyBillWave, FaMoneyCheckAlt, FaSignOutAlt, FaEnvelope, FaWallet, FaCalendarAlt, FaCalculator, FaCreditCard, FaChartPie, FaTags } from 'react-icons/fa';
import { useNavigate, Outlet } from 'react-router-dom';
import { logout } from '../functions/auth';
import Header from '../components/Header';
import AdSense from '../components/AdSense';

/*const menuItems = [
  { name: 'Home', icon: <FaHome />, path: '/home' },
  { name: 'Receita', icon: <FaMoneyBillWave />, path: '/receita' },
  { name: 'Despesa', icon: <FaMoneyCheckAlt />, path: '/despesa' },
];*/

function Layout() {
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  const handleSair = () => {
    logout(); // Remove dados do usuário do localStorage
    navigate('/'); // Redireciona para login
  }

  return (
    <div className="home-container">
      <Header />
      {/* AdSense: crie unidades em AdSense > Anúncios e defina REACT_APP_ADSENSE_SLOT_HEADER no Netlify (Build env) */}
      <AdSense slot={process.env.REACT_APP_ADSENSE_SLOT_HEADER} format="horizontal" className="ad-header" />
      <nav className="sidebar">
        {}
        {/*Home*/}
        <div className={`sidebar-item ${hovered === 'home' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('home')}
        onMouseLeave={() => setHovered(null)}
            onClick={() => navigate('/layout/principal')}
        style={{ cursor: 'pointer' }}
        title="Home">
            <span className="icon"><FaHome /></span>
            <span className="label">{hovered === 'home' && 'Home'}</span>
        </div>
        {/*Contas*/}
        <div className={`sidebar-item ${hovered === 'contas' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('contas')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/contas')}
        style={{ cursor: 'pointer' }}
        title="Contas">
            <span className="icon"><FaWallet /></span>
            <span className="label">{hovered === 'contas' && 'Contas'}</span>
        </div>
        {/*Receita*/}
        <div className={`sidebar-item ${hovered === 'receita' ? 'hovered' : ''}`}   
        onMouseEnter={() => setHovered('receita')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/receita')}
        style={{ cursor: 'pointer' }}
        title="Receita">
            <span className="icon"><FaMoneyBillWave /></span>
            <span className="label">{hovered === 'receita' && 'Receita'}</span>
        </div>
        {/*Despesa*/}
        <div className={`sidebar-item ${hovered === 'despesa' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('despesa')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/despesa')}
        style={{ cursor: 'pointer' }}
        title="Despesa">
            <span className="icon"><FaMoneyCheckAlt /></span>
            <span className="label">{hovered === 'despesa' && 'Despesa'}</span>
        </div>
        {/*Calendário*/}
        <div className={`sidebar-item ${hovered === 'calendario' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('calendario')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/calendario')}
        style={{ cursor: 'pointer' }}
        title="Calendário">
            <span className="icon"><FaCalendarAlt /></span>
            <span className="label">{hovered === 'calendario' && 'Calendário'}</span>
        </div>
        {/*Cartões*/}
        <div className={`sidebar-item ${hovered === 'cartoes' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('cartoes')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/cartoes')}
        style={{ cursor: 'pointer' }}
        title="Cartões de Crédito">
            <span className="icon"><FaCreditCard /></span>
            <span className="label">{hovered === 'cartoes' && 'Cartões'}</span>
        </div>
        {/*Orçamento*/}
        <div className={`sidebar-item ${hovered === 'orcamento' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('orcamento')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/orcamento')}
        style={{ cursor: 'pointer' }}
        title="Orçamento Mensal">
            <span className="icon"><FaChartPie /></span>
            <span className="label">{hovered === 'orcamento' && 'Orçamento'}</span>
        </div>
        {/*Categorias*/}
        <div className={`sidebar-item ${hovered === 'categorias' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('categorias')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/categorias')}
        style={{ cursor: 'pointer' }}
        title="Categorias">
            <span className="icon"><FaTags /></span>
            <span className="label">{hovered === 'categorias' && 'Categorias'}</span>
        </div>
        {/*Calculadoras*/}
        <div className={`sidebar-item ${hovered === 'calculadoras' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('calculadoras')}
        onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate('/layout/calculadora-juros')}
        style={{ cursor: 'pointer' }}
        title="Calculadoras">
            <span className="icon"><FaCalculator /></span>
            <span className="label">{hovered === 'calculadoras' && 'Calculadoras'}</span>
        </div>
        {/*Fale Conosco*/}
        <div className={`sidebar-item ${hovered === 'fale-conosco' ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered('fale-conosco')}
        onMouseLeave={() => setHovered(null)}
        onClick={() => navigate('/fale-conosco')}
        style={{ cursor: 'pointer', marginTop: 'auto', marginBottom: '20px' }}
       
        title="Fale Conosco">
            <span className="icon"><FaEnvelope /></span>
            <span className="label">{hovered === 'fale-conosco' && 'Fale Conosco'}</span>
        </div>
        {/*Sair*/}
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
        {/* Rodapé AdSense: crie outra unidade no AdSense e defina REACT_APP_ADSENSE_SLOT_FOOTER */}
        <AdSense slot={process.env.REACT_APP_ADSENSE_SLOT_FOOTER} format="auto" className="ad-footer" />
      </main>
    </div>
  );
}

export default Layout;